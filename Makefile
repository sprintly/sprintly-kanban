
all: install topcoat

install:
	@npm install
	@npm run build

server:
	cd public && python -m SimpleHTTPServer 9001

watch:
	@npm run watch &
	@npm run watch-test

build:
	@npm run build-production

bootstrap:
	mkdir -p public/less/bootstrap
	cp -r node_modules/bootstrap/less/* public/less/bootstrap

.PHONY: all install deps server

