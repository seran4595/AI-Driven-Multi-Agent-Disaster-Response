class ReportAgent:

    def validate_report(self, disaster):
        """
        Check whether the disaster report is valid.
        """

        if not disaster.disaster_type:
            return False, "Disaster type is missing."

        if not disaster.location:
            return False, "Location is missing."

        if not disaster.severity:
            return False, "Severity is missing."
        return True, "Report is valid."