<template>
  <div class="variableDisplay">
  <div class="table">
    <div class="row">
      <div class="cell">Name:</div>
      <div class="cell">{{variable.name}}</div>
    </div>
    <div class="row">
      <div class="cell">Formula</div>
      <div class="cell"><input v-model.lazy="variable.formula" v-on:change="variable.recalculate()" ></input></div>
    </div>
    <div class="row">
      <div class="cell">Dependencies</div>
      <div class="cell">{{Array.from(variable.getDependencies()).map(function(x) {return x.name}).join(', ')}}</div>
    </div>
    <div class="row">
      <div class="cell">Dependants</div>
      <div class="cell">{{Array.from(variable.getDependants()).map(function(x) {return x.name}).join(', ')}}</div>
    </div>
    <div class="row">
      <div class="cell">value</div>
      <div class="cell">{{variable.value}}</div>
    </div>
  </div>
  <div>
    <span v-if="!variable.isUpToDate">
      <span style="color:red;font-size:1.1em;">out of date</span>
    </span>
    <div v-if="variable.error">
      <span style="color:red;font-size:1.1em;">{{variable.error.message}}</span>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'variable-display',
  props: ['variable'],
  data: function () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.variableDisplay {
  width:100%;
  border:1px solid black;
}
.table {
  display:table
}
.row {
  display:table-row;
}
.cell {
  display:table-cell;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
