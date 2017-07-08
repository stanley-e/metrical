<template>
  <div id="app">
	<div id="topologicalSort" class="main">
	  <div class="box">
		<div style="display:flex">
      <div>
        <div>
          Name:<input v-model="newName"></input>
        </div>
        <div v-for="(value, index) in inputErrorMessages" class="error">
          *{{value}}
        </div>
      </div><div>
        <button v-on:click="addItem()">ADD</button>
      </div>
    </div>
      <variable-display v-for="(value,index) in list" v-bind:variable="value[1]" ></variable-display>
    </div>
  </div>
</div>
</div>
</div>
</div>
</template>
<script>
import variableDisplay from './components/variable-display.vue'
import {MetricalRuntime} from './metrical-script.js'

export default {
  name: 'app',
  components: {
    'variable-display': variableDisplay
  },
  data: function () {
    return {
      newName: '',
      list: [],
      runtime: new MetricalRuntime()
    }
  },
  computed: {
    inputErrorMessages: function () {
      var m = []
      if (/^\d/.test(this.newName)) {
        m.push('A variable name cannot start with a number')
      }
      if (/\s/g.test(this.newName)) {
        m.push('A variable name cannot contain whitespace')
      }
      if (!(/.+/.test(this.newName))) {
        m.push('A variable name cannot be an empty string')
      }
      if (this.nameUsed(this.newName)) {
        m.push('A variable name can\'t be already used')
      }
      return m
    },
    nameIsValid: function () {
      return (this.inputErrorMessages.length === 0)
    }

  },
  methods: {
    addItem: function () {
      if (this.nameIsValid) {
        var newVariable = this.runtime.addVariable([this.newName])
        this.list.push([this.newName, newVariable])
        this.newName = ''
      }
    },
    nameUsed: function (name) {
      for (var i = 0; i < this.list.length; i++) {
        if (this.list[i][0] === name) {
          return true
        }
      }
      return false
    },
    getVariable (name) {
      return this.variables.getMember(name)
    }
    // In order for variables to identify where they belong.
    // A variable when defined will take on a sequence from its root Object
    // If available.
    // Variables will need to check if their subobject implements a certain
    // Method. If it does it will send down a list of
    // The Interpreter function will have to handle it.

    // The first value should be the only place where the object is defined
    // Having the interpreter handle it won't work for when you define your
    // own objects.
    // both Met Variable & MetObject need to perform this check though they
    // respond differently.
    // If an object is called multiple times then it should only take account
    // of the first one since that will be the one where it is defined
    // If a variable is called multiple times then it should raise an error.
    // Each should just have their name key & a point back to their parent
  }
}
</script>
<style>
  #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  }
  .box {
  padding:10px;
  border:1px solid black;
  margin:10px auto;
  }
  .main {
  max-width:640px;
  margin:auto;
  }
  .error {
  color:red;
  font-size:0.8em;
  }
</style>
