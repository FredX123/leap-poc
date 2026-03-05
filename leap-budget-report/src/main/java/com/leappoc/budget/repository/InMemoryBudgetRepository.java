package com.leappoc.budget.repository;

import com.leappoc.budget.model.BudgetRow;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory implementation seeded with sample data.
 */
@Repository
public class InMemoryBudgetRepository implements BudgetRepository {

    private final Map<Long, BudgetRow> store = new ConcurrentHashMap<>();
    private final AtomicLong idSeq = new AtomicLong(0);

    public InMemoryBudgetRepository() {
        seed("Office Supplies",    new BigDecimal("320.00"),  new BigDecimal("500.00"));
        seed("Cloud Hosting",      new BigDecimal("4800.00"), new BigDecimal("5000.00"));
        seed("Marketing",          new BigDecimal("2200.00"), new BigDecimal("3000.00"));
        seed("Travel & Lodging",   new BigDecimal("1500.00"), new BigDecimal("1200.00"));
        seed("Software Licenses",  new BigDecimal("950.00"),  new BigDecimal("1000.00"));
        seed("Training & Certs",   new BigDecimal("600.00"),  new BigDecimal("800.00"));
    }

    private void seed(String desc, BigDecimal expenses, BigDecimal budget) {
        long id = idSeq.incrementAndGet();
        store.put(id, new BudgetRow(id, desc, expenses, budget));
    }

    @Override
    public List<BudgetRow> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Optional<BudgetRow> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public BudgetRow save(BudgetRow row) {
        if (row.getId() == null) {
            row.setId(idSeq.incrementAndGet());
        }
        store.put(row.getId(), row);
        return row;
    }
}
