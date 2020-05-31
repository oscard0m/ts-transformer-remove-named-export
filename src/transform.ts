import * as ts from 'typescript';

type Config = {
	blacklistedExorts: string[];
}

const isBlacklistedIdentifier = (node: ts.NamedDeclaration, blacklistedExorts: string[]): boolean => {
	if (!node.name) {
		return false;
	}

	return blacklistedExorts.includes(node.name.getText());
};

const isExportDeclaration = (node: ts.Declaration): boolean => {
	return !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export);
};

const hasBlacklistedExportDeclaration = (node: ts.VariableStatement, blacklistedExorts: string[]): boolean => {
	return node.declarationList.declarations.some((declaration: ts.VariableDeclaration): boolean => {
		return isExportDeclaration(declaration) &&
			isBlacklistedIdentifier(declaration, blacklistedExorts);
	});
};

const isBlacklistedNamedExportVariable = (node: ts.Node, blacklistedExorts: string[]): boolean => {
	return ts.isVariableStatement(node) &&
		hasBlacklistedExportDeclaration(node, blacklistedExorts);
};

const isNamedExportFunction = (node: ts.Node): boolean => {
	return ts.isFunctionDeclaration(node) &&
		isExportDeclaration(node);
};

const isBlacklistedNamedExportFunction = (node: ts.Node, blacklistedExorts: string[]): boolean => {
	return isNamedExportFunction(node) &&
		isBlacklistedIdentifier(node as ts.FunctionDeclaration, blacklistedExorts);
};

const isBlacklistedExportStatement = (node: ts.Node, blacklistedExorts: string[]): boolean => {
	return ts.isExportSpecifier(node) &&
		isBlacklistedIdentifier(node, blacklistedExorts);
};

export default function(
	program: ts.Program,
	{ blacklistedExorts }: Config
): ts.TransformerFactory<ts.SourceFile> {
	function transformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
		return (sourceFile: ts.SourceFile): ts.SourceFile => {
			const visitor = (node: ts.Node): ts.Node | undefined => {
				if (
					isBlacklistedExportStatement(node, blacklistedExorts) ||
					isBlacklistedNamedExportFunction(node, blacklistedExorts) ||
					isBlacklistedNamedExportVariable(node, blacklistedExorts)
				) {
					return undefined;
				}

				return ts.visitEachChild(node, visitor, context);
			};

			return ts.visitNode(sourceFile, visitor);
		};
	}

	return transformer;
}