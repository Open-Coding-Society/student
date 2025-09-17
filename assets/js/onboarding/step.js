export class step {
    static steps = []; /// Steps for current OS (might be out of date when calling early)
    static starterSteps = []
    static windowsSteps = []
    static macSteps = []
    static selectedOS = 0 
    /* 
    0 = [startup]
    1 = [windows]
    2 = [mac]
    applies to the steps too
    */
    static currentStep = 0
    static constructorStep = 0
    static targetDiv = document.getElementById("step_div")

static StepForward(){
    if (this.steps[this.currentStep + 1]){
        console.log("Moving Forward")
        this.currentStep += 1
        this.RenderStep()
    } else{
        console.log("Can't Step Forward. No Step in the next index")
    }
}

static StepBackward(){
    if (this.steps[this.currentStep - 1]){
        console.log("Moving Back")
        this.currentStep -= 1
        this.RenderStep()
    } else{
        console.log("Can't Step Backward. No Step in the next index")
    }
}


static selectOS(stepOS){
        if (stepOS < 0 || stepOS > 2){
            console.error("Step OS number is not defined");
            return
        }
        if (stepOS == 0){
            step.steps = step.starterSteps
        }
        if (stepOS == 1){
            step.steps = step.windowsSteps
        }
        if (stepOS == 2){
            step.steps = step.macSteps
        }
        console.log("OS Selected")
}

static RenderStep() {
    const stepData = this.starterSteps[this.currentStep];
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
            <span>Step ${stepData.stepNumber + 1} of ${this.steps.length}</span>
            <button id="go_forward">Next ➡</button>
        </div>
    `;

    // Re-bind buttons after re-render
    document.getElementById("go_forward").addEventListener("click", () => {
        this.StepForward();
    });
    document.getElementById("go_backward").addEventListener("click", () => {
        this.StepBackward();
    });
}
/*
innerHTML is just the raw html shown in the step
title is the title at the top of the step
stepOS is the os the step is targeted to 1 = Windows/LInux 0 = MacOS

*/
    constructor(innerhtml, title, stepOS){
        this.html = innerhtml;
        this.title = title;
        this.OS = stepOS
        this.stepNumber = step.constructorStep;
        step.constructorStep += 1

        if (stepOS < 0 || stepOS > 2){
            console.error("Step OS number is not defined");
            return
        }
        if (stepOS == 0){
            step.starterSteps.push(this)
        }
        if (stepOS == 1){
            step.windowsSteps.push()
        }
        if (stepOS == 2){
            step.macSteps.push(this)
        }
        console.log(`Step Created:${this.stepNumber}`);
    }
}