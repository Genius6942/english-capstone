export default function updateInstructions(text: string) {
	const box = document.getElementById("instructions") as HTMLDivElement;
	box.innerHTML = text;
};