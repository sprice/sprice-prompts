import * as _opentelemetry_sdk_node from '@opentelemetry/sdk-node';
import { Ast } from '@puzzlet/templatedx';
import { TypsafeTemplate } from '@puzzlet/agentmark';

type PuzzletProps = {
    apiKey: string;
    appId: string;
    baseUrl?: string;
};
type FetchTemplateOptions = {
    cache: {
        ttl?: number;
    } | false;
};
type TemplateRunner = <Input extends Record<string, any>, Output>(ast: Ast) => Omit<TypsafeTemplate<Input, Output>, 'content'>;
type DefaultIO = {
    input: Record<string, any>;
    output: any;
};
declare class Puzzlet<T extends {
    [P in keyof T]: {
        input: any;
        output: any;
    };
} = {
    [key: string]: DefaultIO;
}> {
    private apiKey;
    private appId;
    private baseUrl;
    private createRunner?;
    constructor({ apiKey, appId, baseUrl }: PuzzletProps, createRunner: TemplateRunner);
    initTracing({ disableBatch }?: {
        disableBatch?: boolean;
    }): _opentelemetry_sdk_node.NodeSDK;
    fetchPrompt: <Path extends keyof T | (T extends {
        [key: string]: DefaultIO;
    } ? string : never)>(templatePath: Path, options?: FetchTemplateOptions) => Promise<Path extends keyof T ? TypsafeTemplate<T[Path]["input"], T[Path]["output"]> : TypsafeTemplate<any, any>>;
    private fetchRequestForTemplate;
}

declare const trace: <A extends unknown, F extends (...args: A[]) => ReturnType<F>>(name: string, fn: F) => Promise<ReturnType<F>>;
declare const component: <A extends unknown, F extends (...args: A[]) => ReturnType<F>>(name: string, fn: F) => Promise<ReturnType<F>>;

export { Puzzlet, component, trace };
