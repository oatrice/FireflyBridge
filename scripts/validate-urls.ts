#!/usr/bin/env bun

/**
 * Script to validate URLs in hotlines data and remove invalid ones
 * Usage: bun run scripts/validate-urls.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const API_FILE = join(process.cwd(), 'apps/frontend/app/api/[[...route]]/route.ts');

interface LinkValidationResult {
    url: string;
    valid: boolean;
    status?: number;
    error?: string;
}

async function validateUrl(url: string): Promise<LinkValidationResult> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; URLValidator/1.0)',
            },
        });

        clearTimeout(timeoutId);

        const valid = response.ok || response.status === 403; // 403 might still be valid (blocking bots)
        return {
            url,
            valid,
            status: response.status,
        };
    } catch (error: any) {
        return {
            url,
            valid: false,
            error: error.message,
        };
    }
}

async function main() {
    console.log('🔍 Reading API file...');
    const content = readFileSync(API_FILE, 'utf-8');

    // Extract all URLs from links objects
    const urlPattern = /(facebook|website|line):\s*"([^"]+)"/g;
    const urls: { type: string; url: string; line: string }[] = [];

    let match;
    while ((match = urlPattern.exec(content)) !== null) {
        urls.push({
            type: match[1],
            url: match[2],
            line: match[0],
        });
    }

    console.log(`\n📊 Found ${urls.length} URLs to validate\n`);

    const results: { [key: string]: LinkValidationResult } = {};
    const invalidUrls: string[] = [];

    // Validate all URLs
    for (let i = 0; i < urls.length; i++) {
        const { type, url, line } = urls[i];
        process.stdout.write(`[${i + 1}/${urls.length}] Testing ${type}: ${url}... `);

        const result = await validateUrl(url);
        results[line] = result;

        if (result.valid) {
            console.log(`✅ OK (${result.status})`);
        } else {
            console.log(`❌ FAILED (${result.error || result.status})`);
            invalidUrls.push(line);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total URLs: ${urls.length}`);
    console.log(`Valid: ${urls.length - invalidUrls.length}`);
    console.log(`Invalid: ${invalidUrls.length}`);

    if (invalidUrls.length > 0) {
        console.log('\n❌ Invalid URLs found:');
        invalidUrls.forEach(line => {
            const result = results[line];
            console.log(`  - ${line}`);
            console.log(`    Reason: ${result.error || `HTTP ${result.status}`}`);
        });

        console.log('\n🔧 Removing invalid URLs from file...');
        let newContent = content;

        // Remove invalid URL lines
        invalidUrls.forEach(line => {
            // Remove the entire line including the property
            const lineRegex = new RegExp(`\\s*${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},?\\n`, 'g');
            newContent = newContent.replace(lineRegex, '');
        });

        // Clean up empty links objects
        newContent = newContent.replace(/links:\s*\{\s*\}/g, '');
        newContent = newContent.replace(/,\s*links:\s*\{\s*\}/g, '');

        // Write back to file
        writeFileSync(API_FILE, newContent, 'utf-8');
        console.log('✅ File updated successfully!');
    } else {
        console.log('\n✅ All URLs are valid!');
    }
}

main().catch(console.error);
