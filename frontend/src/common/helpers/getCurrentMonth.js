export const currentMonth = () => {
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const date = new Date();
	return monthNames[date.getMonth()];
};
