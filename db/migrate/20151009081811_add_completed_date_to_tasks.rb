class AddCompletedDateToTasks < ActiveRecord::Migration
  def change
    add_column :tasks, :done_at, :timestamp
  end
end
