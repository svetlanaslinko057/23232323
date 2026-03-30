#!/usr/bin/env python3
"""
FOMO Arena Backend API Testing
Tests all backend endpoints including health, indexer status, contract config, and markets.
"""

import requests
import sys
import json
from datetime import datetime

class FOMOArenaAPITester:
    def __init__(self, base_url="https://deploy-guide-59.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout (30s)")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': 'Request timeout'
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test(
            "API Health Check",
            "GET",
            "api/health",
            200
        )

    def test_indexer_status(self):
        """Test indexer status endpoint"""
        return self.run_test(
            "Indexer Status",
            "GET", 
            "api/onchain/indexer/status",
            200
        )

    def test_contract_config(self):
        """Test contract configuration endpoint"""
        return self.run_test(
            "Contract Configuration",
            "GET",
            "api/onchain/config",
            200
        )

    def test_markets_list(self):
        """Test markets list endpoint"""
        return self.run_test(
            "Markets List",
            "GET",
            "api/onchain/markets",
            200
        )

    def test_onchain_stats(self):
        """Test onchain statistics endpoint"""
        return self.run_test(
            "Onchain Statistics",
            "GET",
            "api/onchain/stats",
            200
        )

    def test_ticker_data(self):
        """Test ticker data endpoint"""
        return self.run_test(
            "Ticker Data",
            "GET",
            "api/ticker",
            200
        )

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )

    def test_swagger_docs(self):
        """Test Swagger documentation endpoint"""
        return self.run_test(
            "Swagger Documentation",
            "GET",
            "api/docs",
            200
        )

def main():
    """Main test execution"""
    print("🚀 Starting FOMO Arena Backend API Tests")
    print("=" * 60)
    
    tester = FOMOArenaAPITester()
    
    # Core API tests
    print("\n📋 CORE API TESTS")
    print("-" * 30)
    
    # Health check - most critical
    health_success, health_data = tester.test_health_check()
    if not health_success:
        print("\n❌ CRITICAL: Health check failed - backend may be down")
        print("Continuing with other tests...")
    
    # Root endpoint
    tester.test_root_endpoint()
    
    # Swagger docs
    tester.test_swagger_docs()
    
    # Onchain functionality tests
    print("\n🔗 ONCHAIN FUNCTIONALITY TESTS")
    print("-" * 35)
    
    # Indexer status - critical for blockchain functionality
    indexer_success, indexer_data = tester.test_indexer_status()
    if indexer_success and isinstance(indexer_data, dict):
        # Check nested data structure
        data = indexer_data.get('data', {})
        is_running = data.get('isRunning', False) if data else indexer_data.get('isRunning', False)
        if is_running:
            print("✅ Indexer is running correctly")
        else:
            print("⚠️  WARNING: Indexer is not running (isRunning: false)")
    
    # Contract configuration
    config_success, config_data = tester.test_contract_config()
    if config_success and isinstance(config_data, dict):
        print(f"✅ Contract config loaded: {len(config_data)} configuration items")
    
    # Markets list
    markets_success, markets_data = tester.test_markets_list()
    if markets_success and isinstance(markets_data, list):
        print(f"✅ Markets loaded: {len(markets_data)} markets found")
    elif markets_success and isinstance(markets_data, dict):
        markets_count = markets_data.get('total', 0)
        print(f"✅ Markets loaded: {markets_count} markets found")
    
    # Statistics
    tester.test_onchain_stats()
    
    # Ticker data
    tester.test_ticker_data()
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(tester.failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            error_msg = test.get('error', f"Status {test.get('actual', 'unknown')}")
            print(f"{i}. {test['name']} - {error_msg}")
    
    # Critical checks
    critical_issues = []
    if not health_success:
        critical_issues.append("Health check failed - backend may be down")
    
    if indexer_success and isinstance(indexer_data, dict):
        data = indexer_data.get('data', {})
        is_running = data.get('isRunning', False) if data else indexer_data.get('isRunning', False)
        if not is_running:
            critical_issues.append("Indexer is not running - blockchain sync disabled")
    
    if critical_issues:
        print(f"\n🚨 CRITICAL ISSUES FOUND:")
        for issue in critical_issues:
            print(f"   • {issue}")
        return 1
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())