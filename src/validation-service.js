angular.module(
    "byng.module.validation.service.validation",
    [
        "byng.module.functional-helpers.service.functional-helpers"
    ]
)
    .service("Validation", function Validation($injector, isDefined) {
        "use strict";

        var that = this;

        function getValidator(type) {
            try {
                return $injector.get(
                    "VALIDATION_TYPE_" + type.toUpperCase(),
                    "byng.module.validation.service.validation"
                );
            } catch (e) {
                throw "Unrecognised type '" + type + "'";
            }
        }

        function testValidationSet(type, value, context) {
            var validator = getValidator(type);
            var errors = [];

            if (Array.isArray(validator)) {
                validator.forEach(function(test) {
                    errors.push(runTest(test, value, context));
                });
            } else {
                errors.push(runTest(validator, value, context));
            }

            return errors
                .filter(isDefined())
                .reduce(function(a, b) { return a.concat(b); }, []);
        }

        function runTest(validator, value, context) {
            if (typeof validator === "function") {
                return validator(value, context);
            } else {
                if (validator.test instanceof RegExp) {
                    return validator.test.test(value) ? undefined : validator.message;
                } else if (validator.test instanceof Function) {
                    return validator.test(value, context) ? undefined : validator.message;
                } else {
                    throw "Validation types must be RegExp or Functions";
                }
            }
        }

        that.test = function (type, value, context) {
            if (typeof type !== "string") {
                throw "Expecting a type";
            }
            if (arguments.length < 2) {
                throw "Expecting a value";
            }

            return !(testValidationSet(type, value, context).length);
        };

        that.errors = function (type, value, context) {
            if (type === undefined) {
                throw "Expecting a type";
            }
            if (arguments.length < 2) {
                throw "Expecting a value";
            }

            var errors = [].concat(testValidationSet(type, value, context));

            errors.and = {
                throwFirst: function() {
                    if (errors.length) {
                        throw new TypeError(errors[0]);
                    }
                },
                throwAll: function() {
                    if (errors.length) {
                        throw new TypeError(errors);
                    }
                }
            };

            return errors;
        };
    });
