BINARY_NAME=linq
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
LDFLAGS=-ldflags "-X github.com/linq-team/linq-cli/cmd.version=$(VERSION)"

OPENAPI_SPEC=spec/openapi.yaml
OPENAPI_URL=https://apidocs.linqapp.com/openapi.yaml

.PHONY: build install clean generate spec test lint release snapshot

build:
	go build $(LDFLAGS) -o bin/$(BINARY_NAME) .

install:
	go install $(LDFLAGS) .

clean:
	rm -rf bin/ dist/

# Download latest public OpenAPI spec
spec:
	@mkdir -p spec
	curl -sL "$(OPENAPI_URL)" -o $(OPENAPI_SPEC)
	@echo "Downloaded latest OpenAPI spec to $(OPENAPI_SPEC)"

# Generate Go types from OpenAPI spec (requires oapi-codegen)
generate:
	@if [ ! -f "$(OPENAPI_SPEC)" ]; then \
		echo "OpenAPI spec not found. Run 'make spec' first."; \
		exit 1; \
	fi
	@mkdir -p internal/apiv3
	oapi-codegen -config oapi-codegen.yaml $(OPENAPI_SPEC)
	@echo "Generated types in internal/apiv3/"

test:
	go test ./...

lint:
	golangci-lint run

# Build for all platforms (requires goreleaser)
release:
	goreleaser release --clean

# Local snapshot build for all platforms
snapshot:
	goreleaser release --snapshot --clean