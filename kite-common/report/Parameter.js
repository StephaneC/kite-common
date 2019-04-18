
/**
 * Class: Parameter
 * Description:
 */
class Parameter {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  toJson() {
    return JSON.stringify(this);
  }
}



module.exports = Parameter;