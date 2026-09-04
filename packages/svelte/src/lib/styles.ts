export function mergeStyles(generated: string, style: string | null | undefined): string {
	return style === null || style === undefined || style.length === 0
		? generated
		: `${generated};${style}`;
}
