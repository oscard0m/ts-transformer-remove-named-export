const a = {
	onBrowser: (): string => { return 'onBrowser'; },
	onExtraction: (): string => { return 'onExtraction'; }
};

export default { ...a };
