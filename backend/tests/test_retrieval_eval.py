import pytest
from app.knowledge.retrieval import KnowledgeRetrievalService


def test_eval_baby_crying_retrieval():
    query = "My baby won't stop crying."
    results = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
    assert len(results) > 0
    top_1 = results[0]
    assert "infant" in [t.lower() for t in top_1.tags] or "crying" in [t.lower() for t in top_1.tags]
    assert "Infants" in top_1.category


def test_eval_toddler_tantrum_retrieval():
    query = "My toddler has a tantrum when it is time to leave the park."
    results = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
    assert len(results) > 0
    top_1 = results[0]
    assert "tantrums" in [t.lower() for t in top_1.tags] or "transition" in [t.lower() for t in top_1.tags]
    assert "Toddlers" in top_1.category


def test_eval_sibling_conflict_retrieval():
    query = "My child hits their sibling."
    results = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
    assert len(results) > 0
    top_1 = results[0]
    assert "sibling conflict" in [t.lower() for t in top_1.tags] or "aggression" in [t.lower() for t in top_1.tags]
    assert "Preschoolers" in top_1.category


def test_eval_homework_refusal_retrieval():
    query = "My child refuses to do homework."
    results = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
    assert len(results) > 0
    top_1 = results[0]
    assert "homework" in [t.lower() for t in top_1.tags] or "responsibility" in [t.lower() for t in top_1.tags]
    assert "School-Age" in top_1.category


def test_eval_teen_curfew_retrieval():
    query = "My teenager missed curfew."
    results = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
    assert len(results) > 0
    top_1 = results[0]
    assert "curfew" in [t.lower() for t in top_1.tags] or "boundary testing" in [t.lower() for t in top_1.tags]
    assert "Adolescence" in top_1.category


def test_eval_overall_metrics():
    test_cases = [
        ("My baby won't stop crying", "crying"),
        ("My toddler has a tantrum when leaving the park", "tantrums"),
        ("My child hits their sibling", "sibling conflict"),
        ("My child refuses to do homework", "homework"),
        ("My teenager missed curfew", "curfew"),
    ]

    top_1_hits = 0
    top_3_hits = 0
    total = len(test_cases)

    for query, expected_keyword in test_cases:
        res = KnowledgeRetrievalService.retrieve(query=query, top_k=3)
        if not res:
            continue
        # Top-1 check
        if expected_keyword in res[0].content.lower() or any(expected_keyword in t.lower() for t in res[0].tags):
            top_1_hits += 1

        # Top-3 recall check
        if any(expected_keyword in r.content.lower() or any(expected_keyword in t.lower() for t in r.tags) for r in res):
            top_3_hits += 1

    top_1_acc = (top_1_hits / total) * 100
    top_3_recall = (top_3_hits / total) * 100

    print(f"\nRetrieval Evaluation Summary:")
    print(f"Top-1 Accuracy: {top_1_acc:.1f}% ({top_1_hits}/{total})")
    print(f"Top-3 Recall:   {top_3_recall:.1f}% ({top_3_hits}/{total})")

    assert top_1_acc >= 80.0
    assert top_3_recall == 100.0
