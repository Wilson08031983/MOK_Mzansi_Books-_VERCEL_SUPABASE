#!/bin/bash

# MOK Mzansi Books - Postman Test Runner Script
# This script runs automated tests using Postman CLI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Postman CLI is installed
check_postman_cli() {
    if ! command -v postman >/dev/null 2>&1; then
        print_error "Postman CLI is not installed"
        echo "Please run the setup script first: ./setup-postman-cli.sh"
        exit 1
    fi
}

# Function to check authentication
check_authentication() {
    print_status "Checking Postman authentication..."
    
    # Note: Current Postman CLI doesn't have a direct way to check auth status
    # Authentication will be verified when running collections
    print_warning "Note: Authentication status will be verified when running collections"
}

# Function to find collection file by name pattern
find_collection_file() {
    local collection_pattern="$1"
    local collection_file
    
    # Look for collection files matching the pattern
    collection_file=$(find "$COLLECTIONS_DIR" -name "*$collection_pattern*.postman_collection.json" | head -1)
    
    if [ -z "$collection_file" ] || [ ! -f "$collection_file" ]; then
        return 1
    fi
    
    echo "$collection_file"
    return 0
}

# Function to find environment file by name pattern
find_environment_file() {
    local env_pattern="$1"
    local env_file
    
    # Look for environment files matching the pattern
    env_file=$(find "$ENVIRONMENTS_DIR" -name "*$env_pattern*.postman_environment.json" | head -1)
    
    if [ -z "$env_file" ] || [ ! -f "$env_file" ]; then
        return 1
    fi
    
    echo "$env_file"
    return 0
}

# Function to run collection by file path
run_collection_by_path() {
    local collection_file="$1"
    local env_file="$2"
    
    if [ ! -f "$collection_file" ]; then
        print_error "Collection file not found: $collection_file"
        return 1
    fi
    
    local collection_name=$(basename "$collection_file" .postman_collection.json)
    print_status "Running collection: $collection_name"
    
    # Build command
    local cmd="postman collection run \"$collection_file\""
    
    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        cmd="$cmd -e \"$env_file\""
        print_status "Using environment: $(basename "$env_file")"
    fi
    
    print_status "Executing: $cmd"
    
    # Run the collection
    if eval "$cmd"; then
        print_success "✓ Collection run completed: $collection_name"
        return 0
    else
        print_error "✗ Collection run failed: $collection_name"
        return 1
    fi
}

# Function to run all authentication tests
run_auth_tests() {
    local environment="$1"
    local output_dir="$2"
    
    print_status "Running authentication tests..."
    
    local collection_name="MOK Mzansi Books - Authentication Tests"
    local output_file=""
    
    if [ -n "$output_dir" ]; then
        output_file="$output_dir/auth-tests-$(date +%Y%m%d-%H%M%S).json"
    fi
    
    run_collection "$collection_name" "$environment" "$output_file"
}

# Function to run all business operations tests
run_business_tests() {
    local environment="$1"
    local output_dir="$2"
    
    print_status "Running business operations tests..."
    
    local collection_name="MOK Mzansi Books - Business Operations Tests"
    local output_file=""
    
    if [ -n "$output_dir" ]; then
        output_file="$output_dir/business-tests-$(date +%Y%m%d-%H%M%S).json"
    fi
    
    run_collection "$collection_name" "$environment" "$output_file"
}

# Function to run main API collection
run_main_collection() {
    local environment="$1"
    local output_dir="$2"
    
    print_status "Running main API collection..."
    
    local collection_name="MOK Mzansi Books API"
    local output_file=""
    
    if [ -n "$output_dir" ]; then
        output_file="$output_dir/main-api-$(date +%Y%m%d-%H%M%S).json"
    fi
    
    run_collection "$collection_name" "$environment" "$output_file"
}

# Function to run smoke tests (quick validation)
run_smoke_tests() {
    local environment="$1"
    
    print_status "Running smoke tests (quick validation)..."
    
    # Create a temporary collection for smoke tests
    local smoke_requests=(
        "GET /api/logo"
        "POST /api/signup (with invalid data to test validation)"
    )
    
    print_status "Smoke tests would include:"
    for request in "${smoke_requests[@]}"; do
        echo "  - $request"
    done
    
    print_warning "Smoke tests require manual collection creation or specific endpoint testing"
    print_status "Running authentication tests as smoke test alternative..."
    
    run_auth_tests "$environment" ""
}

# Function to generate test report
generate_report() {
    local output_dir="$1"
    
    if [ ! -d "$output_dir" ]; then
        print_warning "No output directory found, skipping report generation"
        return 0
    fi
    
    print_status "Generating test report..."
    
    local report_file="$output_dir/test-report-$(date +%Y%m%d-%H%M%S).html"
    local json_files=("$output_dir"/*.json)
    
    if [ ${#json_files[@]} -eq 0 ] || [ ! -f "${json_files[0]}" ]; then
        print_warning "No JSON test results found, skipping HTML report generation"
        return 0
    fi
    
    # Simple HTML report generation
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>MOK Mzansi Books - API Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; }
        .failure { background: #f8d7da; border: 1px solid #f5c6cb; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MOK Mzansi Books - API Test Report</h1>
        <p class="timestamp">Generated: $(date)</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p>Test results from JSON files in: $output_dir</p>
        <ul>
EOF

    for json_file in "${json_files[@]}"; do
        if [ -f "$json_file" ]; then
            local filename=$(basename "$json_file")
            echo "            <li>$filename</li>" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF
        </ul>
    </div>
    
    <div class="note">
        <h3>Note</h3>
        <p>For detailed test results, please review the individual JSON files or use Postman's built-in reporting features.</p>
        <p>Consider using Newman HTML reporter for more detailed reports:</p>
        <code>npm install -g newman-reporter-html</code>
    </div>
</body>
</html>
EOF

    print_success "HTML report generated: $report_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo "Test Types:"
    echo "  auth          Run authentication tests"
    echo "  business      Run business operations tests"
    echo "  main          Run main API collection"
    echo "  smoke         Run smoke tests (quick validation)"
    echo "  all           Run all tests (default)"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to use (Development, Staging, Production)"
    echo "  -o, --output DIR         Output directory for test results"
    echo "  -r, --report             Generate HTML report"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 auth -e Development"
    echo "  $0 all -e Staging -o ./test-results -r"
    echo "  $0 smoke -e Production"
}

# Main execution function
main() {
    echo ""
    print_status "MOK Mzansi Books - API Test Runner"
    print_status "=================================="
    echo ""
    
    # Check prerequisites
    check_postman_cli
    check_authentication
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    POSTMAN_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Define collection and environment paths
    MAIN_COLLECTION="$POSTMAN_DIR/MOK_Mzansi_Books_API.postman_collection.json"
    DEV_ENV="$POSTMAN_DIR/environments/development.postman_environment.json"
    
    # Run tests based on arguments
    if [ $# -eq 0 ]; then
        # Run all tests
        print_status "Running all test collections..."
        
        # Run main collection
        if [ -f "$MAIN_COLLECTION" ]; then
            run_collection_by_path "$MAIN_COLLECTION" "$DEV_ENV"
        else
            print_warning "Main collection not found: $MAIN_COLLECTION"
        fi
        
        # Run test collections
        TEST_DIR="$POSTMAN_DIR/tests"
        if [ -d "$TEST_DIR" ]; then
            for collection in "$TEST_DIR"/*.json; do
                if [ -f "$collection" ]; then
                    run_collection_by_path "$collection" "$DEV_ENV"
                fi
            done
        fi
        
    else
        # Run specific collection
        local collection_arg="$1"
        local env_arg="$2"
        
        # Check if it's a file path or name
        if [ -f "$collection_arg" ]; then
            run_collection_by_path "$collection_arg" "$env_arg"
        else
            # Try to find collection by name
            local found_collection=""
            
            # Check main collection
            if [[ "$(basename "$MAIN_COLLECTION" .postman_collection.json)" == *"$collection_arg"* ]]; then
                found_collection="$MAIN_COLLECTION"
            fi
            
            # Check test collections
            if [ -z "$found_collection" ] && [ -d "$POSTMAN_DIR/tests" ]; then
                for collection in "$POSTMAN_DIR/tests"/*.json; do
                    if [ -f "$collection" ] && [[ "$(basename "$collection" .json)" == *"$collection_arg"* ]]; then
                        found_collection="$collection"
                        break
                    fi
                done
            fi
            
            if [ -n "$found_collection" ]; then
                run_collection_by_path "$found_collection" "$env_arg"
            else
                print_error "Collection not found: $collection_arg"
                print_status "Available collections:"
                [ -f "$MAIN_COLLECTION" ] && echo "  - $(basename "$MAIN_COLLECTION")"
                [ -d "$POSTMAN_DIR/tests" ] && find "$POSTMAN_DIR/tests" -name "*.json" -exec basename {} \;
                exit 1
            fi
        fi
    fi
    
    print_success "Test execution completed!"
}

# Run main function with all arguments
main "$@"