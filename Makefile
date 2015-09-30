
all: install build

install:
	@npm install

watch:
	@node_modules/.bin/gulp

build:
	@npm run build &
	@npm run build-less &
	@npm run build-test &

build-production:
	@npm run build-production

bootstrap:
	mkdir -p public/less/bootstrap
	cp -r node_modules/bootstrap/less/* public/less/bootstrap

check_status:
	@status=$$(git status --porcelain); \
	if test "x$${status}" = x; then \
		echo "Working directory clean..."; \
	else \
		git status; \
		echo "Working directory is dirty"; \
		false; \
	fi

deploy: check_status
	@echo "Starting deploy..."
	git branch -f cli-deploy
	git checkout cli-deploy
	npm run build-production
	rm npm-shrinkwrap.json
	npm shrinkwrap
	git add public package.json npm-shrinkwrap.json
	git commit -m 'asset compile for deploy'
	git push -f heroku cli-deploy:master
	git checkout -
	@echo "\nDone deploying to git deployment branch."

react-select:
	mkdir -p public/less/react-select
	cp -r node_modules/react-select/less/* public/less/react-select

test:
	@npm test

test-file:
	@find ./app -name *-test.js -print | awk '{print "require(\"."$$1"\");"}' > test/index.js
	@echo "test/index.js written"

test-server: test-file
	@npm run build-test
	@open http://localhost:8003/test/index.html
	@python -m SimpleHTTPServer 8003

shrinkwrap:
	npm shrinkwrap --dev
	git add npm-shrinkwrap.json package.json
	git commit -m 'updating shrinkwrap' -e

.PHONY: all install server test watch
