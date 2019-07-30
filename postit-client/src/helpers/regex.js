export default {
    email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    emptyString: /^$/,
    hasWhiteSpace: /\s/,
    allButLetters: /[^a-z0-9]/,
    allButLettersAndDomain: /[^a-z0-9\-._]/
}