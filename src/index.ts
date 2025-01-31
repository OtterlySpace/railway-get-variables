import * as core from "@actions/core"
import * as exec from "@actions/exec"

const TEAM_NAME = core.getInput("TEAM_NAME")
const PROJECT_NAME = core.getInput("PROJECT_NAME")
const ENV_NAME = core.getInput("ENV_NAME")
const SERVICE_NAME = core.getInput("SERVICE_NAME")
const VARIABLES_NAMES = core.getInput("VARIABLES_NAMES")

async function runCommand(command: string, args: string[] = []) {
	let output = ""
	let error = ""
	const options = {
		listeners: {
			stdout: (data: Buffer) => {
				output += data.toString()
			},
			stderr: (data: Buffer) => {
				error += data.toString()
			}
		}
	}
	await exec.exec(command, args, options)
	return { output, error }
}

function exportVariables(variablesNames: string[], variables: Record<string, string>) {
	for (const variableName of variablesNames) {
		const variableValue = variables[variableName]
		if (!variableValue) {
			console.warn(`Variable ${variableName} was not found, skipping`)
			continue
		}
		core.exportVariable(variableName, variableValue)
	}
}

async function getServiceVariables(serviceName: string) {
	try {
		const { output, error } = await runCommand("railway", [
			"variables",
			"--environment",
			ENV_NAME,
			"--service",
			serviceName,
			"--json"
		])
		if (error) {
			throw new Error(error)
		}

		const variables = JSON.parse(output) as Record<string, string>
		return variables
	} catch (error) {
		console.error(error)
		core.setFailed("Failed to get service variables")
		throw error
	}
}

async function linkProject() {
	try {
		const { output, error } = await runCommand("railway", [
			"link",
			"--team",
			TEAM_NAME,
			"--project",
			PROJECT_NAME,
			"--environment",
			ENV_NAME,
			"--json"
		])
		if (error) {
			throw new Error(error)
		}
		console.log(output)
	} catch (error) {
		console.error(error)
		core.setFailed("Failed to link project")
		throw error
	}
}

async function run() {
	const { error } = await runCommand("which", ["railway"])
	if (error) {
		console.error(error)
		core.setFailed("Railway CLI not found")
		return
	}

	await linkProject()

	const variables = await getServiceVariables(SERVICE_NAME)

	exportVariables(VARIABLES_NAMES.split(","), variables)
}

void run()
