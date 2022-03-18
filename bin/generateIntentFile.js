const fs = require("fs");
const ts = require("typescript");
const prettier = require("prettier");

const { getAlexaIntentNameTransformers } = require("@volley/gev/dist/src/alexa/plugins/hooks/intent/config/getAlexaIntentNameTransformers");
const { getGoogleIntentNameTransformers } = require("@volley/gev/dist/src/google/plugins/hooks/intent/config/getGoogleIntentNameTransformers");

const SOURCE_FILE = "src/config/types/autogen/AutoIntent.ts";
const MODEL_FILE = "models/en.json";
const TYPE_NAME = "AutoIntent"

function createSimpleIntentType(intentName) {
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("SimpleIntent"),
      [ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(intentName))]
    );
}

function createGevIntentType(intentName, slots) {
    function createTypeProperty(name, typeNode) {
        if (typeof typeNode === "string") {
            typeNode = ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(typeNode));
        }
        return ts.factory.createPropertySignature(undefined, name, undefined, typeNode, undefined);
    }

    const slotProperties = slots.map(
        slot => createTypeProperty(slot.name, ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("GevSlot")))
    );

    return ts.factory.createTypeLiteralNode([
        createTypeProperty("name", intentName),
        createTypeProperty("slots", ts.factory.createTypeLiteralNode(slotProperties))
    ]);
}

function createUnionType(typeName, typeNodes) {
    return ts.factory.createTypeAliasDeclaration(
        undefined,
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(typeName),
        undefined,
        ts.factory.createUnionTypeNode(typeNodes),
    );
}

function createImport(members, moduleName) {
    const importSpecifiers = members.map(name => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name)));
    const bindinds = ts.factory.createNamedImports(importSpecifiers)
    const importClause = ts.factory.createImportClause(false, undefined, bindinds);
    return ts.factory.createImportDeclaration(undefined, undefined,importClause, ts.factory.createStringLiteral(moduleName), undefined);
}

function getIntentFromType(typeNode) {
    if (typeNode.kind === ts.SyntaxKind.TypeReference &&
        typeNode.typeName.escapedText === 'SimpleIntent' &&
        typeNode.typeArguments.length >= 1) {
        return {
            name: typeNode.typeArguments[0].literal.text,
            isSimple: true
        }
    } else if (typeNode.kind === ts.SyntaxKind.TypeLiteral) {
        const nameProperty = typeNode.members.find(m => m.name.escapedText === "name");
        if (nameProperty) {
            return {
                name: nameProperty.type.literal.text,
                isSimple: false,
            }
        }
    }
}

function getIntentsFromSourceFile(tsSourceFile) {
    const sourceIntents = {};

    ts.forEachChild(tsSourceFile, node => {
        switch (node.kind) {
            case ts.SyntaxKind.TypeAliasDeclaration: {
                const types = node.type.kind === ts.SyntaxKind.UnionType ? node.type.types : [node.type];
                types.forEach((t, i) => {
                    const intent = getIntentFromType(t);
                    if (intent) {
                        sourceIntents[intent.name] = {
                            ...intent,
                            index: i
                        }
                    } else {
                        console.error(`[WARN] Invalid Intent type detected`);
                    }
                });
            }
        }
    });

    return sourceIntents;
}

function getIntentsFromModel(modelFile) {
    const model = JSON.parse(fs.readFileSync(modelFile, "utf-8"));

    const createTransformer = transformers => name =>
        transformers.reduce((intent, transformer) => ({
            ...intent,
            name: intent.name.replace(transformer, "")
        }), name);

    const alexaIntentNameTransformer = createTransformer(getAlexaIntentNameTransformers());
    const googleIntentNameTransformer = createTransformer(getGoogleIntentNameTransformers());

    let intents = model.intents
        .map(intent => ({ ...intent, slots: intent.inputs }))
        .map(alexaIntentNameTransformer)
        .map(googleIntentNameTransformer);

    try {
        const alexIntents = model.alexa.interactionModel.languageModel.intents
            .map(alexaIntentNameTransformer)
        intents = intents.concat(alexIntents);
    } catch(e) {}

    // Add platform-specific intents from Google Actions
    try {
      const googleIntents = restructureGoogleIntents(
        model.googleAssistant.custom.intents
      ).map(googleIntentNameTransformer);
      intents = intents.concat(googleIntents);
    } catch (e) {}

    return intents.map((intent) => ({
      ...intent,
      isSimple: !intent.slots || intent.slots.length === 0,
    }));
}

/**
 * 
 * Jovo currently uses Google's structure for their platform-specific intents.
 * 
 * This function reshapes that object to resemble Alexa's structure so that we can easily generate the corresponding types with this file.
 *  
 */
function restructureGoogleIntents(intents) {
  const remappedIntents = [];

  /* 
    Regex to extract slots from Google Actions Training Phrases 
    Example: ($SLOT_NAME 'example value' auto=true)
  */
  const regex = /\$\w+/gm;

  for (var details of Object.entries(intents)) {
    const intentName = details[0];
    const intentData = details[1];
    const newIntentObject = {name: intentName, slots: []};
    const trainingPhrases = intentData.trainingPhrases;
    
    // Extract slot names and structure them similar to Alexa
    trainingPhrases.forEach((phrase) => {
      const matches = phrase.match(regex);
      if (matches) {
        matches.forEach((slot) => {
          newIntentObject.slots.push({name: slot.replace("$", "")});
        })
      }
    });

    remappedIntents.push(newIntentObject);
  }
  return remappedIntents;
}

function main() {
    let intentSourceCode = "";
    try {
        intentSourceCode = fs.readFileSync(SOURCE_FILE).toString();
    } catch (e) {}

    const intentSourceFile = ts.createSourceFile(
        SOURCE_FILE,
        intentSourceCode,
        ts.ScriptTarget.Latest,
        false
    );

    const sourceIntents = getIntentsFromSourceFile(intentSourceFile);
    const modelIntents = getIntentsFromModel(MODEL_FILE);

    const intentTypes = modelIntents
        .sort((a, b) => {
            /* preserve sort order of existing source file */
            const aIndex = sourceIntents[a.name] ? sourceIntents[a.name].index : Infinity;
            const bIndex = sourceIntents[b.name] ? sourceIntents[b.name].index : Infinity;

            if (aIndex !== Infinity && bIndex !== Infinity) {
                if (aIndex > bIndex) {
                    return 1;
                } else if (aIndex < bIndex) {
                    return -1;
                } else {
                    return 0;
                }
            }

            return a.isSimple ? -1 : 1;
        })
        .map(intent => (
            intent.isSimple ?
                createSimpleIntentType(intent.name) :
                createGevIntentType(intent.name, intent.slots)
        ));

    const importDecl = createImport(["GevSlot", "SimpleIntent"], "@volley/gev");
    const typeDecl = createUnionType(TYPE_NAME, intentTypes);

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const source = printer.printList(ts.ListFormat.SourceFileStatements, [importDecl, typeDecl], intentSourceFile);

    fs.writeFileSync(SOURCE_FILE, prettier.format(source, { parser: "typescript" }));
}

main();
