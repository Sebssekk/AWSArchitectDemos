#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Cdk4AwsArchitectStack } from '../lib/cdk4_aws_architect-stack';
import * as dotenv from 'dotenv'
dotenv.config()

console.log("[*] Preflight - Checking required envs")

if (!process.env.NICKNAME || process.env.NICKNAME.trim() === '') {
    throw new Error('NICKNAME environment variable is required and cannot be blank')
}
if (!process.env.EMAIL || process.env.EMAIL.trim() === '') {
    throw new Error('EMAIL environment variable is required and cannot be blank') 
}
console.log("[*] OK")
console.log("|------[CDK build Starting]------|")

const app = new cdk.App();
new Cdk4AwsArchitectStack(app, 'Cdk4AwsArchitectStack');

console.log("[*] Happy AWS Teaching!")