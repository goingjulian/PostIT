export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function stringsAreNotEmpty(...strings) {
	for (let string of strings) {
		if (!/\S/.test(string)) return false;
	}
	return true;
}

export function stringsAreEmpty(...strings) {
	for (let string of strings) {
		if (!/\S/.test(string)) return true;
	}
	return false;
}