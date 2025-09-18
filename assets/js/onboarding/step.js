export class step {
    static steps = []; 
    static starterSteps = []
    static windowsSteps = []
    static macSteps = []
    static selectedOS = 0   // default to starter
    static currentStep = 0
    static constructorStep = 0
    static targetDiv = document.getElementById("step_div")

    static StepForward() {
        if (this.steps[this.currentStep + 1]) {
            console.log("Moving Forward")
            this.currentStep += 1
            this.RenderStep()
        } else {
            console.log("Can't Step Forward. No Step in the next index")
        }
    }

    static StepBackward() {
        if (this.steps[this.currentStep - 1]) {
            console.log("Moving Back")
            this.currentStep -= 1
            this.RenderStep()
        } else {
            console.log("Can't Step Backward. No Step in the next index")
        }
    }

    static selectOS(stepOS) {
        if (stepOS < 0 || stepOS > 2) {
            console.error("Step OS number is not defined");
            return
        }

        if (stepOS === 0) {
            this.steps = this.starterSteps
        }
        if (stepOS === 1) {
            this.steps = this.windowsSteps
        }
        if (stepOS === 2) {
            this.steps = this.macSteps
        }

        this.selectedOS = stepOS
        this.currentStep = 0
        console.log(`OS Selected ${stepOS}`, this.steps)
    }

    static RenderStep() {
        const stepData = this.steps[this.currentStep]; 
        if (!stepData) {
            console.error("No step to render at index", this.currentStep);
            return;
        }

        if (!this.targetDiv) {
            this.targetDiv = document.getElementById("step_div");
        }

        this.targetDiv.innerHTML = `
            <div class="step-header">
                <h2>${stepData.title}</h2>
            </div>
            <div class="step-body">
                ${stepData.html}
            </div>
            <div class="step-footer">
                <button id="go_backward">⬅ Back</button>
                <span>Step ${this.currentStep + 1} of ${this.steps.length}</span>
                <button id="go_forward">Next ➡</button>
                <button id="change_os"> Change OS </button>
            </div>
        `;

        document.getElementById("go_forward").addEventListener("click", () => {
            this.StepForward();
        });
        document.getElementById("go_backward").addEventListener("click", () => {
            this.StepBackward();
        });
        document.getElementById("change_os").addEventListener("click", () => {
            if (this.selectedOS === 0) {
                // leave Starter → go to Windows
                this.selectOS(1)
                this.RenderStep()
            } else if (this.selectedOS === 1) {
                // Windows → Mac
                this.selectOS(2)
                this.RenderStep()
            } else if (this.selectedOS === 2) {
                // Mac → Windows
                this.selectOS(1)
                this.RenderStep()
            }
        });
    }

    constructor(innerhtml, title, stepOS) {
        this.html = innerhtml;
        this.title = title;
        this.OS = stepOS
        this.stepNumber = step.constructorStep;
        step.constructorStep += 1

        if (stepOS === 0) {
            step.starterSteps.push(this)
        }
        if (stepOS === 1) {
            step.windowsSteps.push(this)
        }
        if (stepOS === 2) {
            step.macSteps.push(this)
        }
        console.log(`Step Created:${this.stepNumber} for OS ${stepOS}`);
    }
}

// ✅ Call this once when page loads
step.selectOS(0)    // make sure steps = starterSteps
step.RenderStep()
