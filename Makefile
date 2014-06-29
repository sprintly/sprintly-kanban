TOPCOAT_TARGET := desktop
TOPCOAT_COLOR := light

all: install topcoat

install:
	@npm install
	@npm run build

build:
	@npm run build-production

watch:
	@npm run watch &
	@npm start

topcoat:
	cp node_modules/topcoat-icons/font/icomatic.* public/font/
	cp node_modules/topcoat-icons/font/icomatic.js public/js/
	cat node_modules/topcoat/css/topcoat-$(TOPCOAT_TARGET)-$(TOPCOAT_COLOR).css node_modules/topcoat-icons/font/icomatic.css > public/css/topcoat.css

.PHONY: all install deps

