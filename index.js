/*
To extract all first data items of the same structure and same type from a JSON object
*/

function defaultGetType(value) {
  let typeStr = typeof value;

  if (typeStr === "object") {
    if (value === null) return "null";
    if (value instanceof Array) {
      return value.length === 0 ? "array-empty" : "array";
    }
    if (Object.prototype.toString.call(value) === "[object Object]") {
      for (let k in value) {
        return "object";
      }
      return "object-empty";
    }
  } else if (typeStr === "string") {
    return value.length === 0 ? "string-empty" : "string";
  } else if (typeStr === "number") {
    if (value === 0) return "number-zero";
    if (!Number.isNaN(value) && Number.isFinite(value)) return "number";
  } else if (typeStr === "boolean") {
    return value ? "true" : "false";
  }

  console.log("Invalid type: " + typeStr, value);
  throw new Error("Invalid type: " + typeStr + ", " + value);
}

function _addValue(dest, stack, value) {
  let imax = stack.length - 1;

  let current = dest;
  for (let i = 0; i <= imax; i++) {
    let [key, typeStr] = stack[i].split("@");

    if (key === "[]") {
      if (!(current instanceof Array))
        throw new Error(`Invalid array stack at ${i}, ${stack[i]}`);
      current = current[0];
    } else {
      if (i === imax) {
        if (!(key in current)) {
          current[key] = {};
        }
      }
      current = current[key];
    }

    if (!current) throw new Error(`Unfound stack key at ${i}, ${stack[i]}`);

    if (typeStr in current) {
      if (i === imax)
        throw new Error(`Invalid last stack type at ${i}, ${stack[i]}`);
      current = current[typeStr];
    } else {
      if (i !== imax)
        throw new Error(`Unfound stack type at ${i}, ${stack[i]}`);

      //add value
      if (typeStr === "array") {
        current[typeStr] = [{}]; // save to the first element of the array
      } else if (typeStr === "object") {
        current[typeStr] = {};
      } else {
        current[typeStr] = value;
      }
    }
  }
}

// the key is the value_key + "@" + value_type
function _sampleJson(dest, parentStack, value, valueKey, mapping, getType) {
  let typeStr = getType(value);

  let newStack = parentStack.concat([valueKey + "@" + typeStr]);

  let valueFullKey = newStack.join(".");

  if (!(valueFullKey in mapping)) {
    mapping[valueFullKey] = true;

    _addValue(dest, newStack, value);
  }

  if (typeStr === "array") {
    for (let i = 0; i < value.length; i++) {
      _sampleJson(dest, newStack, value[i], "[]", mapping, getType);
    }
  } else if (typeStr === "object") {
    for (let k in value) {
      _sampleJson(dest, newStack, value[k], k, mapping, getType);
    }
  }
}

function _prefixType(typeStr, value) {
  if (typeof value === "string") return `${typeStr}: ${value}`;

  let str = JSON.stringify(value);
  return typeStr === str ? value : `${typeStr}: ${str}`;
}

// getType: a function to get the type of a value
function _shrink(obj, getType, prefixType) {
  let typeStr = getType(obj);

  if (typeStr === "array") {
    obj = obj[0];
    let keys = Object.keys(obj);
    if (!keys.length) throw new Error("Invalid array length when shrinking");

    return keys.map((key) => _shrink(obj[key], getType, prefixType));
  } else if (typeStr === "object") {
    let result = {};
    for (let k in obj) {
      let obji = obj[k];

      let keys = Object.keys(obji);
      if (!keys.length) throw new Error("Invalid object length when shrinking");

      if (keys.length === 1) {
        result[k] = _shrink(obji[keys[0]], getType, prefixType);
      } else {
        result[k] = keys.reduce((acc, key, idx) => {
          acc["$" + (idx + 1)] = _shrink(obji[key], getType, prefixType);
          return acc;
        }, {});
      }
    }
    return result;
  }

  return prefixType ? _prefixType(typeStr, obj) : obj;
}

/*
options:
  mapping: set an object to receive the mapping of the structure
  getType: a function to get the type of a value (default is defaultGetType)
  prefixType: stringify the value to "type: value" when type string and value string are different
*/
function sampleJson(json, options = null) {
  let mapping = options?.mapping || {};
  let getType = options?.getType || defaultGetType;

  let dest = [{}];
  _sampleJson(dest, [], json, "[]", mapping, getType);

  // console.log("mapping:\n" + Object.keys(mapping).join("\n"));
  // console.log("dest:\n" + JSON.stringify(dest, null, 2));

  let result = _shrink(dest, getType, options?.prefixType)[0];
  // console.log("result:\n" + JSON.stringify(result, null, 2));

  return result;
}

// exports
exports.sampleJson = sampleJson;

exports.defaultGetType = defaultGetType;
