#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import YAML from "yaml"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const yamlContractFiles = [".agents/vouch_governance.yaml"]

const markdownContractFiles = [
  ".agents/vouch_intent.md",
  ".agents/vouch_stripe_payment_architecture.md",
]

const executionFiles = [".agents/vouch_execution.json"]

const errors = []

function readRequired(relativePath) {
  const absolutePath = join(root, relativePath)

  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`)
    return null
  }

  return readFileSync(absolutePath, "utf8")
}

function validateYaml(relativePath) {
  const content = readRequired(relativePath)
  if (content === null) return

  try {
    const parsed = YAML.parse(extractYaml(content))
    if (!parsed || typeof parsed !== "object") {
      errors.push(`Contract must parse to an object: ${relativePath}`)
    }
  } catch (error) {
    errors.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function extractYaml(content) {
  const trimmed = content.replace(/\r\n/g, "\n").trim()
  const fenced = trimmed.match(/```ya?ml\s*\n([\s\S]*?)\n\s*```/i)
  return fenced ? fenced[1] : content
}

function validateJson(relativePath) {
  const content = readRequired(relativePath)
  if (content === null) return

  try {
    JSON.parse(content)
  } catch (error) {
    errors.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function validateMarkdown(relativePath) {
  const content = readRequired(relativePath)
  if (content === null) return

  if (content.trim().length === 0) {
    errors.push(`Contract must not be empty: ${relativePath}`)
  }
}

for (const file of yamlContractFiles) {
  validateYaml(file)
}

for (const file of markdownContractFiles) {
  validateMarkdown(file)
}

for (const file of executionFiles) {
  validateJson(file)
}

if (errors.length > 0) {
  console.error("Contract validation failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `Contract validation passed: ${
    yamlContractFiles.length + markdownContractFiles.length
  } contracts and ${executionFiles.length} execution files.`
)
