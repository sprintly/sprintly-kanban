
all: install bootstrap

install:
	@npm install
	@npm run build

watch:
	@npm run watch &
	@npm run watch-test

build:
	@npm run build-production

bootstrap:
	mkdir -p public/less/bootstrap
	cp -r node_modules/bootstrap/less/* public/less/bootstrap

.PHONY: all install server

