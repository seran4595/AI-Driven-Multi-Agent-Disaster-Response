import unittest

from pydantic import ValidationError

from backend.app.models.schema import DisasterReport


class TestDisasterSchema(unittest.TestCase):
    def base_payload(self):
        return {
            "disaster_type": "Flood",
            "country": "India",
            "state": "Tamil Nadu",
            "city": "Vellore",
            "latitude": 12.9165,
            "longitude": 79.1325,
            "severity": "High",
            "affected_people": 500,
            "description": "Test report",
            "reported_by": "Test User",
        }

    def test_valid_report(self):
        report = DisasterReport(**self.base_payload())
        self.assertEqual(report.disaster_type, "Flood")

    def test_invalid_disaster_type(self):
        payload = self.base_payload()
        payload["disaster_type"] = "Unknown Disaster"
        with self.assertRaises(ValidationError):
            DisasterReport(**payload)

    def test_invalid_severity(self):
        payload = self.base_payload()
        payload["severity"] = "Extreme"
        with self.assertRaises(ValidationError):
            DisasterReport(**payload)


if __name__ == "__main__":
    unittest.main()
