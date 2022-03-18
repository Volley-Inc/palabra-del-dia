# A complete doc on skill alerting is here:
# https://github.com/Volley-Inc/gevops/blob/main/terraform/alert/README.md

# Uncomment the following block to enable alerting (and remove this line)
#
# module "alert" {
#     source = "git@github.com:Volley-Inc/gevops.git//terraform/alert?ref={{gevops-sha}}"

#     name        = var.name
#     skill_id    = var.skill_id
#     skill_stage = "live"
#     skill_type  = "custom"

#     metric_window_hours             = 1
#     failure_percentage_threshold    = 1.0
#     slack_alert_channels            = ["#alerts"]

#     schedule_expression = "rate(15 minutes)"
#     lambda_timeout      = 5
# }
