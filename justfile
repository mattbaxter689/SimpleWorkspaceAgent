set dotenv-load := true

# Submit DSL pipeline to Azure ML for training. For local submission only
run:
    bun start

# Format code to match prettier specifications and organize imports
format:
    bun run format
