angular.module(
    "byng.module.validation.service.validation"
)
    .constant("VALIDATION_TYPE_ARGUMENTS", function(value, context) {
        var getTypeOfValue = function(val) {
            if (val === null) {
                return "null";
            } else if (val + "" === "NaN") { // can't do a straight check, jshint complains
                return "NaN";
            } else {
                try {
                    return val.constructor.name;
                } catch (e) {
                    return typeof val;
                }
            }
        };
        var errors = [];
        (context.$types || [])
            .forEach(function(type, index) {
                if (typeof type === "string") {
                    if (getTypeOfValue(value[index]).toLowerCase() !== type.toLowerCase()) {
                        errors.push(
                            "Expecting '" + type + "' at index " + index + " - got '" +
                                getTypeOfValue(value[index]) + "'"
                        );
                    }
                } else if (typeof type === "function") {
                    if (!(value[index] instanceof type)) {
                        errors.push(
                            "Expecting '" + type.name + "' at index " + index + " - got '" +
                                getTypeOfValue(value[index]) + "'"
                        );
                    }
                }
            });

        return errors;
    });
