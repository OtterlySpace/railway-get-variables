import * as core from "@actions/core"
import * as exec from "@actions/exec"
import * as io from "@actions/io"

const TEAM_NAME = core.getInput("TEAM_NAME")
const PROJECT_NAME = core.getInput("PROJECT_NAME")
const ENV_NAME = core.getInput("ENV_NAME")
const SERVICE_NAME = core.getInput("SERVICE_NAME")
const VARIABLES_NAMES = core.getInput("VARIABLES_NAMES")

let railwayPath: string

async function runCommand(command: string, args: string[] = []) {
	let output = ""
	let error = ""
	const options: exec.ExecOptions = {
		listeners: {
			stdout: (data: Buffer) => {
				output += data.toString()
			},
			stderr: (data: Buffer) => {
				error += data.toString()
			}
		},
		silent: true
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
		const { output, error } = await runCommand(railwayPath, [
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
		const { output, error } = await runCommand(railwayPath, [
			"link",
			"--team",
			TEAM_NAME,
			"--project",
			PROJECT_NAME,
			"--environment",
			ENV_NAME,
			"--service",
			SERVICE_NAME,
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
	railwayPath = await io.which("railway", true)

	await linkProject()

	const variables = await getServiceVariables(SERVICE_NAME)

	exportVariables(VARIABLES_NAMES.split(","), variables)
}

void run()
