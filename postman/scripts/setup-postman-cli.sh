#!/bin/bash

# MOK Mzansi Books - Postman CLI Setup Script
# This script automates the installation and configuration of Postman CLI

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Homebrew is installed
check_homebrew() {
    if ! command_exists brew; then
        print_error "Homebrew is not installed. Please install Homebrew first:"
        echo "Visit: https://brew.sh/"
        echo "Or run: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    print_success "Homebrew is installed"
}

# Function to install Postman CLI
install_postman_cli() {
    print_status "Installing Postman CLI..."
    
    if command_exists postman; then
        print_warning "Postman CLI is already installed"
        postman --version
        return 0
    fi
    
    # Install using Homebrew
    if brew install postman-cli; then
        print_success "Postman CLI installed successfully"
        postman --version
    else
        print_error "Failed to install Postman CLI"
        exit 1
    fi
}

# Function to authenticate with Postman
authenticate_postman() {
    print_status "Setting up Postman authentication..."
    
    # Check if API key is provided as environment variable
    if [ -n "$POSTMAN_API_KEY" ]; then
        print_status "Using API key from environment variable"
        export POSTMAN_API_KEY="$POSTMAN_API_KEY"
        print_success "API key configured"
        return 0
    fi
    
    # Check if Postman CLI is available
    if postman login --help >/dev/null 2>&1; then
        print_status "Postman CLI is available for authentication..."
        print_warning "Note: Authentication status cannot be checked directly with current CLI"
    fi
    
    echo ""
    print_status "Choose authentication method:"
    echo "1. Interactive login (recommended for first-time setup)"
    echo "2. API key (for automation/CI)"
    echo "3. Skip authentication (configure manually later)"
    echo ""
    
    read -p "Enter your choice (1-3): " auth_choice
    
    case $auth_choice in
        1)
            print_status "Starting interactive login..."
            print_warning "This will open a browser window for authentication"
            if postman login; then
                print_success "Interactive login completed"
            else
                print_error "Interactive login failed"
                exit 1
            fi
            ;;
        2)
            echo ""
            print_status "API Key Authentication"
            print_warning "Your API key will be stored securely in your environment"
            echo ""
            echo "To get your API key:"
            echo "1. Go to https://web.postman.co/settings/me/api-keys"
            echo "2. Click 'Generate API Key'"
            echo "3. Copy the generated key"
            echo ""
            
            read -p "Enter your Postman API key: " api_key
            
            if [ -n "$api_key" ]; then
                export POSTMAN_API_KEY="$api_key"
                
                # Add to shell profile for persistence
                shell_profile=""
                if [ -f "$HOME/.zshrc" ]; then
                    shell_profile="$HOME/.zshrc"
                elif [ -f "$HOME/.bashrc" ]; then
                    shell_profile="$HOME/.bashrc"
                elif [ -f "$HOME/.bash_profile" ]; then
                    shell_profile="$HOME/.bash_profile"
                fi
                
                if [ -n "$shell_profile" ]; then
                    echo "" >> "$shell_profile"
                    echo "# Postman API Key" >> "$shell_profile"
                    echo "export POSTMAN_API_KEY=\"$api_key\"" >> "$shell_profile"
                    print_success "API key added to $shell_profile"
                    print_warning "Please restart your terminal or run: source $shell_profile"
                fi
                
                print_success "API key configured"
            else
                print_error "No API key provided"
                exit 1
            fi
            ;;
        3)
            print_warning "Skipping authentication. You can configure it later using:"
            echo "  postman login  # For interactive login"
            echo "  export POSTMAN_API_KEY=\"your-api-key\"  # For API key"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Function to verify collections and environments exist
verify_postman_data() {
    print_status "Verifying Postman collections and environments..."
    
    # Get the directory where this script is located
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    POSTMAN_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Check if collections exist
    if [ ! -d "$POSTMAN_DIR" ]; then
        print_error "Postman directory not found: $POSTMAN_DIR"
        exit 1
    fi
    
    # Check main collection
    MAIN_COLLECTION="$POSTMAN_DIR/MOK_Mzansi_Books_API.postman_collection.json"
    if [ -f "$MAIN_COLLECTION" ]; then
        print_success "Main API collection found: $MAIN_COLLECTION"
    else
        print_warning "Main collection not found: $MAIN_COLLECTION"
    fi
    
    # Check test collections
    TEST_DIR="$POSTMAN_DIR/tests"
    if [ -d "$TEST_DIR" ]; then
        print_status "Checking test collections..."
        for collection in "$TEST_DIR"/*.json; do
            if [ -f "$collection" ]; then
                collection_name=$(basename "$collection")
                print_success "Test collection found: $collection_name"
            fi
        done
    fi
    
    # Check environments
    ENV_DIR="$POSTMAN_DIR/environments"
    if [ -d "$ENV_DIR" ]; then
        print_status "Checking environments..."
        for env in "$ENV_DIR"/*.json; do
            if [ -f "$env" ]; then
                env_name=$(basename "$env")
                print_success "Environment found: $env_name"
            fi
        done
    fi
    
    print_warning "Note: Postman CLI doesn't support import commands. Collections must be imported manually via Postman app."
}

# Function to run basic tests
run_basic_tests() {
    print_status "Running basic CLI verification..."
    
    # Check if Postman CLI is working
    if postman --version >/dev/null 2>&1; then
        print_success "Postman CLI is working"
        postman --version
    else
        print_warning "Could not verify Postman CLI version"
        return 1
    fi
    
    # Check if help command works
    if postman --help >/dev/null 2>&1; then
        print_success "Postman CLI help is accessible"
    else
        print_warning "Could not access Postman CLI help"
        return 1
    fi
    
    print_warning "Note: Collection and environment listing is not supported by current Postman CLI"
    return 0
}

# Function to display usage instructions
show_usage_instructions() {
    echo ""
    print_success "Postman CLI setup completed!"
    echo ""
    echo "Common commands:"
    echo "  postman collection run <collection-file>   # Run a collection file"
    echo "  postman collection run <collection-file> -e <environment-file>  # Run with environment"
    echo "  postman login                              # Authenticate with Postman"
    echo "  postman logout                             # Sign out from Postman"
    echo ""
    echo "Example test runs:"
    echo "  # Run authentication tests with development environment"
    echo "  postman collection run \"MOK Mzansi Books - Authentication Tests\" -e \"Development\""
    echo ""
    echo "  # Run business operations tests with staging environment"
    echo "  postman collection run \"MOK Mzansi Books - Business Operations Tests\" -e \"Staging\""
    echo ""
    echo "For more information:"
    echo "  postman --help"
    echo "  https://learning.postman.com/docs/postman-cli/postman-cli-overview/"
    echo ""
}

# Main execution
main() {
    echo ""
    print_status "MOK Mzansi Books - Postman CLI Setup"
    print_status "====================================="
    echo ""
    
    # Check prerequisites
    check_homebrew
    
    # Install Postman CLI
    install_postman_cli
    
    # Authenticate
    authenticate_postman
    
    # Verify collections and environments exist
    verify_postman_data
    
    # Run basic tests
    if run_basic_tests; then
        show_usage_instructions
    else
        print_warning "Basic tests failed. Please check your authentication and try again."
        echo ""
        echo "To authenticate manually:"
        echo "  postman login  # Interactive login"
        echo "  export POSTMAN_API_KEY=\"your-api-key\"  # API key method"
    fi
    
    print_success "Setup completed!"
}

# Run main function
main "$@"