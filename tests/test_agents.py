import unittest

from backend.app.agents.coordinator import process_disaster
from backend.app.agents.validation_agent import validate_disaster
from backend.app.models.schema import DISASTER_TYPES, DisasterReport


class TestDisasterResponseAgents(unittest.TestCase):
    def make_report(self, disaster_type="Flood"):
        return DisasterReport(
            disaster_type=disaster_type,
            country="India",
            state="Tamil Nadu",
            city="Vellore",
            latitude=12.9165,
            longitude=79.1325,
            severity="High",
            affected_people=500,
            description="Test disaster report",
            reported_by="Test User",
        )

    def test_all_supported_types_are_validated(self):
        for disaster_type in DISASTER_TYPES:
            with self.subTest(disaster_type=disaster_type):
                self.assertTrue(validate_disaster(self.make_report(disaster_type)))

    def test_unknown_type_is_rejected_by_validation(self):
        report = self.make_report()
        report.disaster_type = "Not A Real Disaster"
        self.assertFalse(validate_disaster(report))

    def test_coordinator_returns_complete_response_plan(self):
        result = process_disaster(self.make_report())

        self.assertTrue(result["success"])
        self.assertIn("AI_Severity", result)
        self.assertIn("Prediction", result)
        self.assertIn("Resources", result)
        self.assertIn("Notification", result)

        expected_resources = {
            "Food", "Water", "Shelter", "Medical",
            "Rescue", "Police", "Transport",
        }
        self.assertEqual(set(result["Resources"]), expected_resources)


if __name__ == "__main__":
    unittest.main()
