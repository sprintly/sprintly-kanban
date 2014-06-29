TOPCOAT_TARGET := desktop
TOPCOAT_COLOR := light

all: install topcoat

install:
	@npm install
	@npm run build

server:
	cd public && python -m SimpleHTTPServer 9001

build:
	@npm run build-production

topcoat:
	cp node_modules/topcoat-icons/font/icomatic.* public/font/
	cp node_modules/topcoat-icons/font/icomatic.js public/js/
	cat node_modules/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css node_modules/topcoat-icons/font/icomatic.css > public/css/topcoat.css

.PHONY: all install deps server

