# TruScore Project Makefile

# Variables
NARGO := nargo
FORGE := forge
NPM := npm
BB := bb

# Directories
CIRCUITS_DIR := circuit
CONTRACTS_DIR := contracts
FRONTEND_DIR := frontend

# Default target
.PHONY: all
all: build

# Circuit related targets
.PHONY: compile-cir
compile-cir:
	@echo "Building Noir circuits..."
	cd $(CIRCUITS_DIR) && $(NARGO) compile

.PHONY: execute-cir
execute-cir:
	@echo "Executing circuits..."
	cd $(CIRCUITS_DIR) && $(NARGO) execute

.PHONY: gen-proof
gen-proof:
	@echo "Generating proofs..."
	cd $(CIRCUITS_DIR) && ls && $(BB) prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target

.PHONY: gen-vk
gen-vk:
	@echo "Generating VK..."
	cd $(CIRCUITS_DIR) && $(BB) write_vk -b ./target/circuit.json -o ./target

.PHONY: verify-proof
verify-proof:
	@echo "Verifying proofs..."
	cd $(CIRCUITS_DIR) && $(BB) verify -k ./target/vk -p ./target/proof

.PHONY: gen-vk-sol
gen-vk-sol:
	@echo "Generating VK..."
	cd $(CIRCUITS_DIR) && $(BB) write_vk -b ./target/circuit.json -o ./target --oracle_hash keccak

.PHONY: gen-verifier-contract
gen-verifier-contract:
	@echo "Generating Verifier Contract..."
	cd $(CIRCUITS_DIR) && $(BB) write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol

# Smart contract related targets
.PHONY: build-contracts
build-contracts:
	@echo "Building smart contracts..."
	cd $(CONTRACTS_DIR) && $(FORGE) build

.PHONY: test-contracts
test-contracts:
	@echo "Running contract tests..."
	cd $(CONTRACTS_DIR) && $(FORGE) test

.PHONY: deploy-contracts
deploy-contracts:
	@echo "Deploying contracts..."
	cd $(CONTRACTS_DIR) && $(FORGE) script scripts/Deploy.s.sol --broadcast

# Frontend related targets
.PHONY: install-frontend
install-frontend:
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && $(NPM) install

.PHONY: build-frontend
build-frontend:
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && $(NPM) run build

.PHONY: dev-frontend
dev-frontend:
	@echo "Starting frontend development server..."
	cd $(FRONTEND_DIR) && $(NPM) run dev

# Combined targets
.PHONY: build
build: compile-circuits build-contracts build-frontend

.PHONY: test
test: check-circuits test-contracts

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	cd $(CIRCUITS_DIR) && $(NARGO) clean
	cd $(CONTRACTS_DIR) && $(FORGE) clean
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/.next

.PHONY: help
help:
	@echo "TruScore Makefile commands:"
	@echo "  make compile-cir  - Compile Noir circuits"
	@echo "  make execute-cir  - Execute Noir circuits"
	@echo "  make gen-proof    - Generate Proof"
	@echo "  make verify-proof   - Verify proofs for Noir circuits"
	@echo "  make gen-vk-sol     - Generate Verification Key for Solidity"
	@echo "  make gen-vk         - Generate Verification Key"
	@echo "  make gen-verifier-contract - Generate Verifier Contract"

	@echo "  make build-contracts   - Build smart contracts"
	@echo "  make test-contracts    - Run contract tests"
	@echo "  make deploy-contracts  - Deploy contracts"
	@echo "  make install-frontend  - Install frontend dependencies"
	@echo "  make build-frontend    - Build frontend"
	@echo "  make dev-frontend      - Start frontend development server"
	@echo "  make build             - Build circuits, contracts, and frontend"
	@echo "  make test              - Run all tests"
	@echo "  make clean             - Clean build artifacts"
	@echo "  make help              - Show this help message" 