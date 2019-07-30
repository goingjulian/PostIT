const initialState = {
    stage: 0,
    values: {
        organisationName: '',
        logoImg: { value: '', uploading: false },
        backgroundImg: { value: '', uploading: false },
        allowedMailDomains: [],
        email: '',
        emailDomain: '',
        firstName: '',
        lastName: '',
        position: ''

    },
    orgNameValid: false,
    orgAdded: false
};

export default function reducerCreateOrganisation(state = {...initialState, values: {...initialState.values}, }, action) {
    const valuesCopy = { ...state.values };
    const valueKey = Object.keys(valuesCopy).find(key => key === action.key);

    switch (action.type) {
        case 'NEXT_STAGE':
            return { ...state, stage: state.stage + 1 };
        case 'PREV_STAGE':
            return { ...state, stage: state.stage > 0 ? state.stage -= 1 : 0 };
        case 'SET_STAGE':
            return { ...state, stage: action.stage };
        case 'SET_VALUE':
            if (action.key === 'allowedMailDomains') {
                if (valuesCopy.allowedMailDomains.length) valuesCopy.emailDomain = valuesCopy.allowedMailDomains[0];
                else valuesCopy.emailDomain = action.value;
                valuesCopy[valueKey].push(action.value);
            }
            else valuesCopy[valueKey] = action.value;
            return { ...state, values: valuesCopy };
        case 'SET_IMG_VALUE':
            valuesCopy[valueKey] = { value: action.value, uploading: false };
            return { ...state, values: valuesCopy };
        case 'SET_IMG_UPLOADING':
            valuesCopy[valueKey] = { ...valuesCopy[valueKey], uploading: true };
            return { ...state, values: valuesCopy };
        case 'RESET_IMG_UPLOADING':
            valuesCopy[valueKey] = { ...valuesCopy[valueKey], uploading: false };
            return { ...state, values: valuesCopy };
        case 'SET_ORG_NAME_VALID':
            return { ...state, orgNameValid: action.orgNameValid };
        case 'ADD_ORG_SUCCESS':
            return { ...state, state: initialState, orgAdded: true };
        case 'REMOVE_ITEM_MULTI_SELECT':
            const valueCopy = [...valuesCopy[action.valueKey]];
            valueCopy.splice(action.itemIndex, 1);
            valuesCopy[action.valueKey] = valueCopy;
            return { ...state, values: valuesCopy };
        default:
            return state;
    }
}
