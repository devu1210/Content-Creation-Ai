import os

def load_template(content_type):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, "prompts", f"{content_type}.txt")
    with open(path, "r", encoding="utf-8") as file:

        return file.read()


def build_prompt(content_type, topic, tone, role, length, format_type, keywords=None):

    template = load_template(content_type)

    # Email does NOT use keywords
    if content_type == "email":

        prompt = template.format(
            topic=topic,
            tone=tone,
            role=role,
            length=length,
            format=format_type
        )

    else:

        if not keywords:
            keywords = "None"

        prompt = template.format(
            topic=topic,
            tone=tone,
            role=role,
            length=length,
            format=format_type,
            keywords=keywords
        )

    return prompt