from crewai import Crew, Process
from backend.agents.tasks import WorkflowTasks

def run_business_workflow(prompt: str, language: str = "English", step_callback=None) -> str:
    """Executes the KisanFlow agricultural advisory workflow using CrewAI."""
    tasks = WorkflowTasks(prompt=prompt, step_callback=step_callback)
    
    # Define the sequential tasks
    agronomy_task = tasks.soil_weather_analysis_task(prompt)
    economy_task = tasks.market_viability_task()
    policy_task = tasks.subsidy_identification_task()
    logistics_task = tasks.logistics_planning_task()
    advisory_task = tasks.final_advisory_synthesis_task(language)
    
    # Form the crew
    crew = Crew(
        agents=[
            tasks.agents.agronomist_agent(step_callback=step_callback),
            tasks.agents.economist_agent(step_callback=step_callback),
            tasks.agents.policy_advisor_agent(step_callback=step_callback),
            tasks.agents.supply_chain_agent(step_callback=step_callback),
            tasks.agents.krishi_mitra_agent(step_callback=step_callback)
        ],
        tasks=[
            agronomy_task,
            economy_task,
            policy_task,
            logistics_task,
            advisory_task
        ],
        process=Process.sequential,
        verbose=True,
        memory=False  # Disabled: memory=True requires an embedding model config (e.g., OpenAI). Re-enable once a Fireworks-compatible embedding endpoint is configured.
    )
    
    # Execute the crew
    result = crew.kickoff()
    return str(result)
