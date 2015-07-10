describe("byng.module.validation.service.validation builtins", function() {
    var Validation;
    beforeEach(function() {
        module("byng.module.validation.service.validation");

        inject(function(_Validation_) {
            Validation = _Validation_;
        });
    });

    describe("VALIDATION_TYPE_ARGUMENTS", function() {
        var VALIDATION_TYPE_ARGUMENTS;
        var func;

        beforeEach(function() {
            try {
                inject(function(_VALIDATION_TYPE_ARGUMENTS_) {
                    VALIDATION_TYPE_ARGUMENTS = _VALIDATION_TYPE_ARGUMENTS_;
                });
            } catch (e) {
                console.log(e);
                // ignore
            }

            func = function testFunction(foo, bar, baz) {};
            func.$types = ["string", RegExp, null];
        });
        it("should be a function", function() {
            expect(VALIDATION_TYPE_ARGUMENTS).toEqual(jasmine.any(Function));
        });

        it("should check types against the $types property of a function", function() {
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", new RegExp("testRegexp"), 42],
                    func
                )
            )
                .toEqual([]);
        });
        
        it("should handle unexpected simple types", function() {
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    [99, new RegExp("testRegexp"), 42],
                    func
                )
            )
                .toEqual(["Expecting 'string' at index 0 - got 'Number'"]);
        });

        it("should handle unexpected objects", function() {
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    [new RegExp("Not right"), new RegExp("testRegexp"), 42],
                    func
                )
            )
                .toEqual(["Expecting 'string' at index 0 - got 'RegExp'"]);
        });
        
        it("should handle wrong object types", function() {
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", new Error(), 42],
                    func
                )
            )
                .toEqual(["Expecting 'RegExp' at index 1 - got 'Error'"]);
        });

        it("should handle special values", function() {
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", null, 42],
                    func
                )
            )
                .toEqual(["Expecting 'RegExp' at index 1 - got 'null'"]);

            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", NaN, 42],
                    func
                )
            )
                .toEqual(["Expecting 'RegExp' at index 1 - got 'NaN'"]);
        });

        it("should handle anonymous functions", function() {
            var noConstructor = function() {};
            noConstructor.constructor = undefined;
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", noConstructor, 42],
                    func
                )
            )
                .toEqual(["Expecting 'RegExp' at index 1 - got 'function'"]);
        });

        it("should gracefully ignore functions with no type signatures", function() {
            func.$types = undefined;
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString", func, 42],
                    func
                )
            )
                .toEqual([]);
        });

        it("should handle comparing typeofs simply", function() {
            func.$types = ["string"];
            expect(
                VALIDATION_TYPE_ARGUMENTS(
                    ["testString"],
                    func
                )
            )
                .toEqual([]);
        });
    });
});
