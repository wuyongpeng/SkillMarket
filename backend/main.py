from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="AI Transformation OS API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Task(BaseModel):
    id: int
    title: str
    tag: str
    steps: List[str]
    duration: str
    badges: List[str]
    completed: bool = False

class Profile(BaseModel):
    name: str
    role: str
    score: int
    initial_score: int
    streak: int
    max_streak: int
    tasks_completed: int
    rank: int
    total_members: int
    joined_days: int

class GroupMember(BaseModel):
    name: str
    color: str
    week: List[int]
    streak: int
    rank: int

# Mock Data
tasks_db = [
    Task(
        id=1,
        title="用 AI 将你昨天的一段会议纪要，改写成可直接发给老板的结构化决策备忘录",
        tag="今日任务",
        duration="预计 5 分钟",
        badges=["沟通效率", "文档写作", "Claude / ChatGPT"],
        steps=[
            "打开 Claude 或 ChatGPT，粘贴你最近一次会议纪要（哪怕很简陋的文字记录都行）",
            "输入 Prompt：「将以上内容改写为决策备忘录，包含：背景一句话、核心决策、执行负责人与时间节点、风险提示」",
            "对比 AI 输出和你自己写的版本，记录最让你惊喜的一点，填入今日反馈"
        ]
    )
]

user_profile = Profile(
    name="吴道子",
    role="产品经理 · 7年",
    score=71,
    initial_score=47,
    streak=23,
    max_streak=31,
    tasks_completed=87,
    rank=2,
    total_members=5,
    joined_days=94
)

group_members = [
    GroupMember(name="你", color="#048a81", week=[1, 1, 1, 1, 1, 1, 1], streak=23, rank=2),
    GroupMember(name="成员 1", color="#5b4fcf", week=[1, 1, 1, 1, 1, 1, 1], streak=31, rank=1),
    GroupMember(name="成员 2", color="#d4890a", week=[1, 1, 0, 1, 1, 0, 1], streak=12, rank=3),
    GroupMember(name="成员 3", color="#c94040", week=[1, 1, 0, 0, 0, 0, 0], streak=2, rank=4),
    GroupMember(name="成员 4", color="#888", week=[1, 0, 1, 0, 1, 0, 1], streak=7, rank=5),
]

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return tasks_db

@app.post("/api/tasks/{task_id}/complete")
async def complete_task(task_id: int):
    for task in tasks_db:
        if task.id == task_id:
            if not task.completed:
                task.completed = True
                user_profile.tasks_completed += 1
                user_profile.streak += 1
                if user_profile.streak > user_profile.max_streak:
                    user_profile.max_streak = user_profile.streak
            return {"status": "success", "task": task}
    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/api/profile", response_model=Profile)
async def get_profile():
    return user_profile

@app.get("/api/group", response_model=List[GroupMember])
async def get_group():
    return sorted(group_members, key=lambda x: x.rank)

@app.get("/api/stats")
async def get_stats():
    return {
        "today": datetime.date.today().strftime("%Y-%m-%d"),
        "weekday": "星期二",  # Simplified for demo
        "day_num": 23
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
