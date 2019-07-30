/**
 * De initial state van de testReducer| Heeft enkel testwaarde
 * Voor de correcte testopzet NIET aanpassen!
 * @type {{testValue: null}}
 */
const initialState = {
  testValue: null
};

/**
 * De test reducer| Heeft enkel testwaarde
 * Voor de correcte testopzet NIET aanpassen!
 * @param state
 * @param action
 * @returns {({testValue: null}&{testValue: *})|{testValue: null}}
 */
export function reducerTest(state = initialState, action) {
    switch (action.type) {
        case 'TEST':
            return {...state, testValue: action.value};
        default:
            return state;
    }
}

/**
 * De test action om de reset functie te checken| Heeft enkel testwaarde
 * Voor de correcte testopzet NIET aanpassen!
 * @param value
 * @returns {{type: string, value: *}}
 */
export function testAction(value){
    return {type:"TEST", value}
}
