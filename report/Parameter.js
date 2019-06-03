/**
 * Class: Parameter
 * Description: Creates a parameter with a name and a value
 */
class Parameter {
  /**
   * Constructor of the parameter class
   * @param {String} name Parameter name
   * @param {Object} value Parameter value
   */
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  /**
   * Returns a string containing the entire contexte
   * @return {String}
   */
  toJson() {
    return JSON.stringify(this);
  }
}

module.exports = Parameter;