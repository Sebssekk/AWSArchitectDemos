#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Cdk4AwsArchitectStack } from '../lib/cdk4_aws_architect-stack';
import * as dotenv from 'dotenv'
import { existsSync, writeFileSync } from 'fs';
import ssh from 'micro-key-producer/ssh.js';
import { randomBytes } from 'micro-key-producer/utils.js';
dotenv.config()

console.log("[*] Preflight - Checking SSH keys for pub-ec2")

if (existsSync('./mod04-compute/ssh-key_ed25519') && existsSync('./mod04-compute/ssh-key_ed25519.pub')){
    console.log("[*] OK")
} else {
    console.log("[...] Generating Missing ssh keys")

    const seed = randomBytes(32);
    const key = ssh(seed, 'ec2-user');
    
    writeFileSync('./mod04-compute/ssh-key_ed25519', key.privateKey)
    writeFileSync('./mod04-compute/ssh-key_ed25519.pub', key.publicKey)
    console.log("[*] Keys generated in ./mod04-compute/")
}

console.log("[*] Preflight - Checking required envs")

if (!process.env.NICKNAME || process.env.NICKNAME.trim() === '') {
    throw new Error('NICKNAME environment variable is required and cannot be blank')
}
if (!process.env.EMAIL || process.env.EMAIL.trim() === '') {
    throw new Error('EMAIL environment variable is required and cannot be blank') 
}
console.log("[*] Envs found")
console.log("|------[CDK build Starting]------|")

const app = new cdk.App();

new Cdk4AwsArchitectStack(app, 'Cdk4AwsArchitectStack');
