#!/bin/bash

# MOK Mzansi Books - Automated Postman Configuration Script
# This script fully automates Postman workspace setup, collection uploads, and environment configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE_NAME="MOK Mzansi Books API"
WORKSPACE_DESCRIPTION="Automated workspace for MOK Mzansi Books API testing and development"
API_BASE_URL="https://api.postman.com"

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

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_api() {
    echo -e "${CYAN}[API]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get API key
get_api_key() {
    if [ -n "$POSTMAN_API_KEY" ]; then
        echo "$POSTMAN_API_KEY"
        return 0
    fi
    
    print_error "POSTMAN_API_KEY environment variable not set"
    echo ""
    echo "To get your API key:"
    echo "1. Go to https://web.postman.co/settings/me/api-keys"
    echo "2. Click 'Generate API Key'"
    echo "3. Copy the generated key"
    echo "4. Export it: export POSTMAN_API_KEY=\"your-key-here\""
    echo ""
    exit 1
}

# Function to make API requests
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local api_key=$(get_api_key)
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "X-API-Key: $api_key" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "X-API-Key: $api_key" \
            "$API_BASE_URL$endpoint"
    fi
}

# Function to check API connectivity
check_api_connectivity() {
    print_step "Checking Postman API connectivity..."
    
    local response=$(api_request "GET" "/me" 2>/dev/null)
    
    if echo "$response" | grep -q '"user"'; then
        local username=$(echo "$response" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        print_success "Connected to Postman API as: $username"
        return 0
    else
        print_error "Failed to connect to Postman API"
        echo "Response: $response"
        exit 1
    fi
}

# Function to create or get workspace
setup_workspace() {
    print_step "Setting up workspace: $WORKSPACE_NAME"
    
    # Check if workspace already exists
    local workspaces=$(api_request "GET" "/workspaces")
    local workspace_id=$(echo "$workspaces" | grep -A 10 "\"name\":\"$WORKSPACE_NAME\"" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$workspace_id" ]; then
        print_success "Workspace already exists: $workspace_id"
        echo "$workspace_id"
        return 0
    fi
    
    # Create new workspace
    print_api "Creating new workspace..."
    local workspace_data="{
        \"workspace\": {
            \"name\": \"$WORKSPACE_NAME\",
            \"description\": \"$WORKSPACE_DESCRIPTION\",
            \"type\": \"personal\"
        }
    }"
    
    local response=$(api_request "POST" "/workspaces" "$workspace_data")
    workspace_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$workspace_id" ]; then
        print_success "Workspace created: $workspace_id"
        echo "$workspace_id"
    else
        print_error "Failed to create workspace"
        echo "Response: $response"
        exit 1
    fi
}

# Function to upload collection
upload_collection() {
    local collection_file="$1"
    local workspace_id="$2"
    
    if [ ! -f "$collection_file" ]; then
        print_warning "Collection file not found: $collection_file"
        return 1
    fi
    
    local collection_name=$(basename "$collection_file" .json)
    print_step "Uploading collection: $collection_name"
    
    # Read and prepare collection data
    local collection_content=$(cat "$collection_file")
    local collection_data="{\"collection\": $collection_content}"
    
    # Upload collection
    print_api "Uploading to workspace: $workspace_id"
    local response=$(api_request "POST" "/collections?workspace=$workspace_id" "$collection_data")
    local collection_id=$(echo "$response" | grep -o '"uid":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$collection_id" ]; then
        print_success "Collection uploaded: $collection_id"
        echo "$collection_id"
    else
        print_warning "Failed to upload collection: $collection_name"
        echo "Response: $response"
        return 1
    fi
}

# Function to upload environment
upload_environment() {
    local env_file="$1"
    local workspace_id="$2"
    
    if [ ! -f "$env_file" ]; then
        print_warning "Environment file not found: $env_file"
        return 1
    fi
    
    local env_name=$(basename "$env_file" .json)
    print_step "Uploading environment: $env_name"
    
    # Read and prepare environment data
    local env_content=$(cat "$env_file")
    local env_data="{\"environment\": $env_content}"
    
    # Upload environment
    print_api "Uploading to workspace: $workspace_id"
    local response=$(api_request "POST" "/environments?workspace=$workspace_id" "$env_data")
    local env_id=$(echo "$response" | grep -o '"uid":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$env_id" ]; then
        print_success "Environment uploaded: $env_id"
        echo "$env_id"
    else
        print_warning "Failed to upload environment: $env_name"
        echo "Response: $response"
        return 1
    fi
}

# Function to create monitor
create_monitor() {
    local collection_id="$1"
    local environment_id="$2"
    local monitor_name="$3"
    local workspace_id="$4"
    
    print_step "Creating monitor: $monitor_name"
    
    local monitor_data="{
        \"monitor\": {
            \"name\": \"$monitor_name\",
            \"collection\": \"$collection_id\",
            \"environment\": \"$environment_id\",
            \"schedule\": {
                \"cron\": \"0 */6 * * *\",
                \"timezone\": \"Africa/Johannesburg\"
            }
        }
    }"
    
    local response=$(api_request "POST" "/monitors?workspace=$workspace_id" "$monitor_data")
    local monitor_id=$(echo "$response" | grep -o '"uid":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$monitor_id" ]; then
        print_success "Monitor created: $monitor_id"
        echo "$monitor_id"
    else
        print_warning "Failed to create monitor: $monitor_name"
        return 1
    fi
}

# Function to setup CLI integration
setup_cli_integration() {
    print_step "Setting up CLI integration..."
    
    # Check if CLI is installed
    if ! command_exists postman; then
        print_warning "Postman CLI not installed. Installing..."
        if command_exists brew; then
            brew install postman-cli
        else
            print_error "Homebrew not found. Please install Postman CLI manually."
            return 1
        fi
    fi
    
    # Test CLI authentication
    if postman login --help >/dev/null 2>&1; then
        print_success "Postman CLI is ready"
    else
        print_warning "Postman CLI authentication may be required"
        echo "Run: postman login"
    fi
}

# Function to generate workspace summary
generate_summary() {
    local workspace_id="$1"
    
    print_step "Generating workspace summary..."
    
    # Get workspace details
    local workspace_details=$(api_request "GET" "/workspaces/$workspace_id")
    local collections=$(api_request "GET" "/collections?workspace=$workspace_id")
    local environments=$(api_request "GET" "/environments?workspace=$workspace_id")
    
    echo ""
    echo "=========================================="
    echo "  POSTMAN WORKSPACE CONFIGURATION COMPLETE"
    echo "=========================================="
    echo ""
    echo "Workspace: $WORKSPACE_NAME"
    echo "Workspace ID: $workspace_id"
    echo "URL: https://web.postman.co/workspace/$workspace_id"
    echo ""
    
    # Count collections
    local collection_count=$(echo "$collections" | grep -o '"name":' | wc -l | tr -d ' ')
    echo "Collections uploaded: $collection_count"
    
    # Count environments  
    local env_count=$(echo "$environments" | grep -o '"name":' | wc -l | tr -d ' ')
    echo "Environments uploaded: $env_count"
    
    echo ""
    echo "Next steps:"
    echo "1. Visit: https://web.postman.co/workspace/$workspace_id"
    echo "2. Run tests: ./postman/scripts/run-tests.sh all -e Development"
    echo "3. View monitors in Postman web interface"
    echo ""
}

# Function to create sync script
create_sync_script() {
    print_step "Creating synchronization script..."
    
    local sync_script="$SCRIPT_DIR/sync-postman.sh"
    
    cat > "$sync_script" << 'EOF'
#!/bin/bash

# MOK Mzansi Books - Postman Sync Script
# Automatically syncs local changes to Postman Cloud

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POSTMAN_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[SYNC]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check for changes and sync
sync_collections() {
    print_status "Checking for collection changes..."
    
    for collection in "$POSTMAN_DIR"/*.json "$POSTMAN_DIR"/tests/*.json; do
        if [ -f "$collection" ]; then
            local filename=$(basename "$collection")
            print_status "Syncing: $filename"
            
            # Use the auto-configure script to upload
            "$SCRIPT_DIR/auto-configure-postman.sh" --sync-only "$collection"
        fi
    done
}

# Main sync function
main() {
    print_status "Starting Postman synchronization..."
    sync_collections
    print_success "Synchronization completed!"
}

# Run if called directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
EOF

    chmod +x "$sync_script"
    print_success "Sync script created: $sync_script"
}

# Main execution function
main() {
    echo ""
    print_status "MOK Mzansi Books - Automated Postman Configuration"
    print_status "=================================================="
    echo ""
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    POSTMAN_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Check API connectivity
    check_api_connectivity
    
    # Setup workspace
    local workspace_id=$(setup_workspace)
    
    # Upload collections
    print_step "Uploading collections..."
    local collection_ids=()
    
    # Main API collection
    if [ -f "$POSTMAN_DIR/MOK_Mzansi_Books_API.postman_collection.json" ]; then
        local main_id=$(upload_collection "$POSTMAN_DIR/MOK_Mzansi_Books_API.postman_collection.json" "$workspace_id")
        if [ -n "$main_id" ]; then
            collection_ids+=("$main_id")
        fi
    fi
    
    # Test collections
    for test_collection in "$POSTMAN_DIR/tests"/*.json; do
        if [ -f "$test_collection" ]; then
            local test_id=$(upload_collection "$test_collection" "$workspace_id")
            if [ -n "$test_id" ]; then
                collection_ids+=("$test_id")
            fi
        fi
    done
    
    # Upload environments
    print_step "Uploading environments..."
    local environment_ids=()
    
    for env_file in "$POSTMAN_DIR/environments"/*.json; do
        if [ -f "$env_file" ]; then
            local env_id=$(upload_environment "$env_file" "$workspace_id")
            if [ -n "$env_id" ]; then
                environment_ids+=("$env_id")
            fi
        fi
    done
    
    # Create monitors for main collections
    if [ ${#collection_ids[@]} -gt 0 ] && [ ${#environment_ids[@]} -gt 0 ]; then
        print_step "Creating monitors..."
        
        # Create monitor for main collection with development environment
        if [ -n "${collection_ids[0]}" ] && [ -n "${environment_ids[0]}" ]; then
            create_monitor "${collection_ids[0]}" "${environment_ids[0]}" "MOK API Health Check" "$workspace_id"
        fi
    fi
    
    # Setup CLI integration
    setup_cli_integration
    
    # Create sync script
    create_sync_script
    
    # Generate summary
    generate_summary "$workspace_id"
    
    print_success "Automated Postman configuration completed!"
}

# Handle command line arguments
if [ "$1" == "--sync-only" ] && [ -n "$2" ]; then
    # Sync mode for individual files
    workspace_id=$(setup_workspace)
    upload_collection "$2" "$workspace_id"
    exit 0
fi

# Run main function
main "$@"