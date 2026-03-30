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

    def test_duels_list(self):
        """Test GET /api/duels endpoint"""
        return self.run_test(
            "Duels List",
            "GET",
            "api/duels",
            200
        )

    def test_duels_open(self):
        """Test GET /api/duels/open endpoint"""
        return self.run_test(
            "Open Duels",
            "GET",
            "api/duels/open",
            200
        )

    def test_duels_summary(self):
        """Test GET /api/duels/summary endpoint"""
        headers = {
            'Content-Type': 'application/json',
            'x-wallet-address': '0xTestWallet123'
        }
        return self.run_test(
            "Duels Summary",
            "GET",
            "api/duels/summary",
            200,
            headers=headers
        )

    def test_create_duel(self):
        """Test POST /api/duels endpoint"""
        test_duel = {
            "marketId": f"test-market-{datetime.now().strftime('%H%M%S')}",
            "predictionTitle": "Test prediction: Bitcoin will reach $100k by end of 2026",
            "side": "yes",
            "stakeAmount": 25,
            "opponentWallet": ""
        }
        
        headers = {
            'Content-Type': 'application/json',
            'x-wallet-address': f'0xTest{datetime.now().strftime("%H%M%S")}'
        }
        
        return self.run_test(
            "Create Duel",
            "POST",
            "api/duels",
            201,
            data=test_duel,
            headers=headers
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
    
    # Duels API tests
    print("\n⚔️  DUELS API TESTS")
    print("-" * 25)
    
    # Test duels endpoints
    duels_success, duels_data = tester.test_duels_list()
    if duels_success and isinstance(duels_data, dict):
        duels_count = len(duels_data.get('data', []))
        print(f"✅ Duels list loaded: {duels_count} duels found")
    
    # Test open duels
    open_duels_success, open_duels_data = tester.test_duels_open()
    if open_duels_success and isinstance(open_duels_data, dict):
        open_count = len(open_duels_data.get('data', []))
        print(f"✅ Open duels loaded: {open_count} open duels found")
    
    # Test duels summary
    summary_success, summary_data = tester.test_duels_summary()
    if summary_success and isinstance(summary_data, dict):
        summary = summary_data.get('data', {})
        if 'activeDuels' in summary:
            print(f"✅ Duels summary: {summary.get('activeDuels', 0)} active, {summary.get('wins', 0)} wins, {summary.get('losses', 0)} losses")
    
    # Test duel creation
    create_success, create_data = tester.test_create_duel()
    if create_success and isinstance(create_data, dict):
        if create_data.get('success') and create_data.get('data'):
            duel_id = create_data['data'].get('id') or create_data['data'].get('_id')
            print(f"✅ Duel created successfully with ID: {duel_id}")
        else:
            print(f"⚠️  Duel creation response: {create_data}")
    
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