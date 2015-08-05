describe("byng.module.validation.service.validation", function() {
    var Validation;
    var VALIDATION_TYPE_TOINT;

    beforeEach(function() {
        module(function($provide) {
            $provide.value("VALIDATION_TYPE_FAKENUMBER", {
                test: /^[0-9]+$/,
                message: "Must be numerical digits"
            });
            $provide.value("VALIDATION_TYPE_FAKEMATCH", {
                test: function(value, context) {
                    return value === context;
                },
                message: "Must match"
            });
            $provide.value("VALIDATION_TYPE_FAKEINVALID", "Hello");
            $provide.value("VALIDATION_TYPE_MULTIPLE", [
                {
                    test: /^.*a.*$/,
                    message: "Must contain the letter 'a'"
                },
                {
                    test: /^[a-z]+$/,
                    message: "Must be lower case"
                }
            ]);
            $provide.value("VALIDATION_TYPE_INTEGRATED", function() {
                return [];
            });
            $provide.value("VALIDATION_TYPE_TOINT", {
                transform: function(value) {
                    return parseInt(value);
                }
            });
        });
        module("byng.module.validation.service.validation");

        inject(function(_Validation_, _VALIDATION_TYPE_TOINT_) {
            Validation = _Validation_;
            VALIDATION_TYPE_TOINT = _VALIDATION_TYPE_TOINT_;
        });
    });

    describe("transform()", function() {
        it("should be a function", function() {
            expect(Validation.transform).toEqual(jasmine.any(Function));
        });

        it("should expect a type", function() {
            expect(Validation.transform.bind(Validation)).toThrow("Expecting a type");
        });

        it("should expect a value", function() {
            expect(Validation.transform.bind(Validation, "type")).toThrow("Expecting a value");
        });

        it("should return the value if the validator does not have a transform() function", function() {
            expect(Validation.transform("fakenumber", 123)).toBe(123);
        });

        it("should return a transformed value if the validator has a transform() function", function() {
            expect(Validation.transform("toint", "123")).toBe(123);
        });

        it("should bind the validator's context into the transform function", function() {
            VALIDATION_TYPE_TOINT.transform = jasmine.createSpy("transform")
                .and.callThrough();

            Validation.transform("toint", "123");

            expect(
                VALIDATION_TYPE_TOINT.transform.calls.mostRecent().object
            ).toEqual(VALIDATION_TYPE_TOINT);
        });
    });

    describe("errors()", function() {

        it("should be a function", function() {
            expect(Validation.errors).toEqual(jasmine.any(Function));
        });

        it("should expect a type", function() {
            expect(Validation.errors.bind(Validation)).toThrow("Expecting a type");
        });

        it("should expect a value", function() {
            expect(Validation.errors.bind(Validation, "some value")).toThrow("Expecting a value");
        });

        it("should expect the given type to be defined", function() {
            expect(Validation.errors.bind(Validation, "This is not a valid type", "some value"))
                .toThrow("Unrecognised type 'This is not a valid type'");
        });

        it("should expect the given type to be a RegExp or Function", function() {
            expect(Validation.errors.bind(Validation, "FAKEINVALID", "some value"))
                .toThrow("Validation types must be RegExp or Functions");
        });

        it("should return an empty array if the value matches the given type", function() {
            var result = Validation.errors("FAKENUMBER", "12345");
            expect(result).toEqual(jasmine.any(Array));
            expect(result.length).toBeLessThan(1);
        });

        it("should return an array of error messages if the value does not match", function() {
            var result = Validation.errors("FAKENUMBER", "Not a number");
            expect(result).toEqual(jasmine.any(Array));
            expect(result.length).toBeGreaterThan(0);
        });

        it("should handle validation sets with multiple tests", function() {
            var result = Validation.errors("MULTIPLE", "abc");
            expect(result).toEqual(jasmine.any(Array));
            expect(result.length).toBe(0);
        });

        it("should handle integrated validation sets", function() {
            var result = Validation.errors("INTEGRATED", "abc");
            expect(result).toEqual(jasmine.any(Array));
        });

        describe("'throw' handlers", function() {
            it("should be added to error arrays", function() {
                var result = Validation.errors("FAKEMATCH", "foo", "bar");
                expect(result.and).toBeDefined();
                expect(result.and.throwFirst).toEqual(jasmine.any(Function));
                expect(result.and.throwAll).toEqual(jasmine.any(Function));
            });

            describe("throwAll()", function() {
                it("should throw the error messages array", function() {
                    var result = Validation.errors("MULTIPLE", "FOO");
                    expect(result.and.throwAll).toThrow(new TypeError("Must contain the letter 'a',Must be lower case"));
                });

                it("should not throw if there is no error", function() {
                    var result = Validation.errors("FAKEMATCH", "foo", "foo");
                    expect(result.and.throwAll).not.toThrow();
                });
            });

            describe("throwFirst()", function() {
                it("should throw the first error message", function() {
                    var result = Validation.errors("FAKEMATCH", "foo", "bar");
                    expect(result.and.throwFirst).toThrow(new TypeError("Must match"));
                });

                it("should not throw if there is no error", function() {
                    var result = Validation.errors("FAKEMATCH", "foo", "foo");
                    expect(result.and.throwFirst).not.toThrow();
                });
            });
        });
    });

    describe("test()", function() {

        it("should be a function", function() {
            expect(Validation.test).toEqual(jasmine.any(Function));
        });

        it("should expect a type", function() {
            expect(Validation.test.bind(Validation)).toThrow("Expecting a type");
        });

        it("should expect a value", function() {
            expect(Validation.test.bind(Validation, "some value")).toThrow("Expecting a value");
        });

        it("should expect the given type to be defined", function() {
            expect(Validation.test.bind(Validation, "This is not a valid type", "some value"))
                .toThrow("Unrecognised type 'This is not a valid type'");
        });

        it("should expect the given type to be a RegExp or Function", function() {
            expect(Validation.test.bind(Validation, "FAKEINVALID", "some value"))
                .toThrow("Validation types must be RegExp or Functions");
        });

        it("should return true if the value matches the given type", function() {
            expect(Validation.test("FAKENUMBER", "12345")).toBe(true);
        });

        it("should return false if the value does not match the given type", function() {
            expect(Validation.test("FAKENUMBER", "Not a number")).toBe(false);
        });

        it("should allow using a context variable for comparisons", function() {
            expect(Validation.test("FAKEMATCH", "Test", "Test")).toBe(true);
            expect(Validation.test("FAKEMATCH", "TEST", "Test")).toBe(false);
        });

        it("should handle validation sets with multiple tests", function() {
            expect(Validation.test("MULTIPLE", "abc")).toEqual(true);
        });

    });
});
