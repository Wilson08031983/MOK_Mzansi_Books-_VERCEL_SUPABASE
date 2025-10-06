#!/bin/bash

# MOK Mzansi Books - Postman Quick Setup Script
# One-command setup for complete Postman integration (CLI + Cloud)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
SETUP_MODE="full"  # full, cli-only, cloud-only

print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                MOK MZANSI BOOKS - POSTMAN SETUP              ║${NC}"
    echo -e "${PURPLE}║              Complete Automation & Integration               ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to show setup options
show_setup_options() {
    echo "Choose your setup type:"
    echo ""
    echo "1. 🚀 Full Setup (Recommended)"
    echo "   - Install & configure Postman CLI"
    echo "   - Upload collections to Postman Cloud"
    echo "   - Set up environments & monitors"
    echo "   - Create sync automation"
    echo ""
    echo "2. 💻 CLI Only"
    echo "   - Install Postman CLI"
    echo "   - Local testing capabilities"
    echo ""
    echo "3. ☁️  Cloud Only"
    echo "   - Upload to Postman Cloud"
    echo "   - Web interface & collaboration"
    echo ""
    echo "4. 🔧 Custom Configuration"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1) SETUP_MODE="full" ;;
        2) SETUP_MODE="cli-only" ;;
        3) SETUP_MODE="cloud-only" ;;
        4) show_custom_options ;;
        *) 
            print_error "Invalid choice. Using full setup."
            SETUP_MODE="full"
            ;;
    esac
}

# Function to show custom options
show_custom_options() {
    echo ""
    echo "Custom Configuration Options:"
    echo ""
    
    # CLI Installation
    read -p "Install Postman CLI? (y/n): " install_cli
    
    # Cloud Upload
    read -p "Upload to Postman Cloud? (y/n): " upload_cloud
    
    # Monitors
    read -p "Create monitoring? (y/n): " create_monitors
    
    # Sync automation
    read -p "Set up sync automation? (y/n): " setup_sync
    
    # Set mode based on selections
    if [[ "$install_cli" == "y" ]] && [[ "$upload_cloud" == "y" ]]; then
        SETUP_MODE="full"
    elif [[ "$install_cli" == "y" ]]; then
        SETUP_MODE="cli-only"
    elif [[ "$upload_cloud" == "y" ]]; then
        SETUP_MODE="cloud-only"
    else
        print_warning "No options selected. Using CLI-only setup."
        SETUP_MODE="cli-only"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    # Check for curl
    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    # Check for jq (for JSON processing)
    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq not found. Installing for JSON processing..."
        if command -v brew >/dev/null 2>&1; then
            brew install jq
        else
            missing_deps+=("jq")
        fi
    fi
    
    # Check for Homebrew (macOS)
    if [[ "$OSTYPE" == "darwin"* ]] && ! command -v brew >/dev/null 2>&1; then
        missing_deps+=("homebrew")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo ""
        echo "Please install the missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "homebrew")
                    echo "  Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                    ;;
                "curl")
                    echo "  curl: Usually pre-installed on macOS/Linux"
                    ;;
                "jq")
                    echo "  jq: brew install jq (macOS) or apt-get install jq (Linux)"
                    ;;
            esac
        done
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to run CLI setup
run_cli_setup() {
    print_step "Setting up Postman CLI..."
    
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local cli_script="$script_dir/setup-postman-cli.sh"
    
    if [ -f "$cli_script" ]; then
        print_status "Running CLI setup script..."
        bash "$cli_script"
        print_success "CLI setup completed"
    else
        print_error "CLI setup script not found: $cli_script"
        return 1
    fi
}

# Function to run cloud configuration
run_cloud_setup() {
    print_step "Setting up Postman Cloud integration..."
    
    # Check for API key
    if [ -z "$POSTMAN_API_KEY" ]; then
        echo ""
        print_warning "Postman API key required for cloud setup"
        echo ""
        echo "To get your API key:"
        echo "1. Go to https://web.postman.co/settings/me/api-keys"
        echo "2. Click 'Generate API Key'"
        echo "3. Copy the generated key"
        echo ""
        
        read -p "Enter your Postman API key: " api_key
        
        if [ -n "$api_key" ]; then
            export POSTMAN_API_KEY="$api_key"
            
            # Save to shell profile
            local shell_profile=""
            if [ -f "$HOME/.zshrc" ]; then
                shell_profile="$HOME/.zshrc"
            elif [ -f "$HOME/.bashrc" ]; then
                shell_profile="$HOME/.bashrc"
            fi
            
            if [ -n "$shell_profile" ]; then
                echo "" >> "$shell_profile"
                echo "# Postman API Key (added by MOK setup)" >> "$shell_profile"
                echo "export POSTMAN_API_KEY=\"$api_key\"" >> "$shell_profile"
                print_success "API key saved to $shell_profile"
            fi
        else
            print_error "No API key provided. Skipping cloud setup."
            return 1
        fi
    fi
    
    # Run cloud configuration
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local cloud_script="$script_dir/auto-configure-postman.sh"
    
    if [ -f "$cloud_script" ]; then
        print_status "Running cloud configuration..."
        bash "$cloud_script"
        print_success "Cloud setup completed"
    else
        print_error "Cloud setup script not found: $cloud_script"
        return 1
    fi
}

# Function to create desktop shortcuts (macOS)
create_shortcuts() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_step "Creating desktop shortcuts..."
        
        local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        local shortcuts_dir="$HOME/Desktop/MOK Postman Tools"
        
        mkdir -p "$shortcuts_dir"
        
        # Create run tests shortcut
        cat > "$shortcuts_dir/Run API Tests.command" << EOF
#!/bin/bash
cd "$script_dir/.."
./scripts/run-tests.sh all -e Development -r
read -p "Press Enter to close..."
EOF
        
        # Create sync shortcut
        cat > "$shortcuts_dir/Sync Collections.command" << EOF
#!/bin/bash
cd "$script_dir"
./sync-postman.sh
read -p "Press Enter to close..."
EOF
        
        chmod +x "$shortcuts_dir"/*.command
        print_success "Desktop shortcuts created in: $shortcuts_dir"
    fi
}

# Function to show completion summary
show_completion_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    SETUP COMPLETED! 🎉                       ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    case $SETUP_MODE in
        "full")
            echo "✅ Postman CLI installed and configured"
            echo "✅ Collections uploaded to Postman Cloud"
            echo "✅ Environments configured"
            echo "✅ Monitoring set up"
            echo "✅ Sync automation ready"
            echo ""
            echo "🚀 Quick Commands:"
            echo "   npm run dev:backend      # Start API on http://localhost:3000"
            echo "   ./postman/scripts/run-tests.sh"
            echo "   ./postman/scripts/sync-postman.sh"
            echo ""
            echo "🌐 Web Access:"
            echo "   https://web.postman.co/"
            ;;
        "cli-only")
            echo "✅ Postman CLI installed and configured"
            echo "✅ Local testing ready"
            echo ""
            echo "🚀 Quick Commands:"
            echo "   # Start API locally"
            echo "   npm run dev:backend      # or: pnpm run dev:backend"
            echo ""
            echo "   # Run collections from files"
            echo "   ./postman/scripts/run-tests.sh"
            echo "   postman collection run \"postman/MOK_Mzansi_Books_API.postman_collection.json\" \\
              -e \"postman/environments/development.postman_environment.json\""
            ;;
        "cloud-only")
            echo "✅ Collections uploaded to Postman Cloud"
            echo "✅ Environments configured"
            echo "✅ Web interface ready"
            echo ""
            echo "🌐 Web Access:"
            echo "   https://web.postman.co/"
            ;;
    esac
    
    echo ""
    echo "📚 Documentation:"
    echo "   ./postman/README.md"
    echo "   https://learning.postman.com/docs/"
    echo ""
}

# Main execution
main() {
    print_header
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                SETUP_MODE="full"
                shift
                ;;
            --cli-only)
                SETUP_MODE="cli-only"
                shift
                ;;
            --cloud-only)
                SETUP_MODE="cloud-only"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --full        Complete setup (CLI + Cloud)"
                echo "  --cli-only    CLI installation only"
                echo "  --cloud-only  Cloud configuration only"
                echo "  --help        Show this help"
                echo ""
                exit 0
                ;;
            *)
                print_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Show options if not specified
    if [ "$SETUP_MODE" == "full" ] && [ $# -eq 0 ]; then
        show_setup_options
    fi
    
    print_status "Setup mode: $SETUP_MODE"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute based on mode
    case $SETUP_MODE in
        "full")
            run_cli_setup
            echo ""
            run_cloud_setup
            create_shortcuts
            ;;
        "cli-only")
            run_cli_setup
            ;;
        "cloud-only")
            run_cloud_setup
            ;;
    esac
    
    # Show completion summary
    show_completion_summary
}

# Run main function
main "$@"