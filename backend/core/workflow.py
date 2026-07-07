from crewai import Crew, Process
from backend.agents.tasks import WorkflowTasks

def run_business_workflow(prompt: str, step_callback=None) -> str:
    """Executes the standard business workflow using CrewAI."""
    tasks = WorkflowTasks(prompt=prompt, step_callback=step_callback)
    
    # Define the sequential tasks
    strategy_task = tasks.strategy_planning_task(prompt)
    research_task = tasks.market_research_task()
    product_task = tasks.product_definition_task()
    
    # Form the crew
    crew = Crew(
        agents=[
            tasks.agents.ceo_agent(step_callback=step_callback),
            tasks.agents.research_agent(step_callback=step_callback),
            tasks.agents.product_manager_agent(step_callback=step_callback)
        ],
        tasks=[
            strategy_task,
            research_task,
            product_task
        ],
        process=Process.sequential,
        verbose=True
    )
    
    # Execute the crew
    result = crew.kickoff()
    return str(result)

