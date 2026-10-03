import * as ts from 'typescript';

export interface TsTranspileResult {
  success: boolean;
  jsCode?: string;
  error?: string;
  errorLine?: number;
}

/**
 * Transpiles TypeScript source code to executable JavaScript,
 * reporting syntax errors with exact line numbers.
 */
export function transpileTypeScript(source: string): TsTranspileResult {
  if (typeof source !== 'string' || !source.trim()) {
    return { success: false, error: 'Source code is empty.' };
  }

  try {
    const result = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        removeComments: false,
        noEmitOnError: false,
      },
      reportDiagnostics: true,
    });

    if (result.diagnostics && result.diagnostics.length > 0) {
      // Find the first error diagnostic
      const errorDiag = result.diagnostics.find(
        (d) => d.category === ts.DiagnosticCategory.Error
      );
      if (errorDiag) {
        let errorLine: number | undefined;
        if (errorDiag.file && errorDiag.start !== undefined) {
          const { line } = errorDiag.file.getLineAndCharacterOfPosition(errorDiag.start);
          errorLine = line + 1;
        }

        const messageText = typeof errorDiag.messageText === 'string'
          ? errorDiag.messageText
          : flattenDiagnosticMessage(errorDiag.messageText);

        return {
          success: false,
          error: `TypeScript Syntax Error: ${messageText}`,
          errorLine
        };
      }
    }

    return {
      success: true,
      jsCode: result.outputText
    };
  } catch (err: any) {
    return {
      success: false,
      error: `TypeScript Transpiler Error: ${err?.message || 'Failed to transpile TypeScript code.'}`
    };
  }
}

function flattenDiagnosticMessage(chain: ts.DiagnosticMessageChain): string {
  let res = chain.messageText;
  if (chain.next) {
    for (const next of chain.next) {
      res += ' ' + flattenDiagnosticMessage(next);
    }
  }
  return res;
}
